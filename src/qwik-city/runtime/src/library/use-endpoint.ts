import { $, useResource$, useSignal } from '@builder.io/qwik';

import { useLocation, useQwikCityEnv } from './use-functions';
import { isServer } from '@builder.io/qwik/build';
import type { ClientPageData, GetEndpointData } from './types';
import { getClientEndpointPath } from './utils';
import { dispatchPrefetchEvent } from './client-navigate';

/**
 * @alpha
 */
export const useEndpoint = <T = unknown>(fetchOptions: RequestInit) => {
  if (fetchOptions.method === "GET" && !fetchOptions.body) {
    throw Error('Cannot pass a body when using the GET method. Remove the body or use a different method (most likely POST)')
  }

  const env = useQwikCityEnv();

  const loc = useLocation();
  const href = loc.href;
  //moving href to outside useResource closure to have easy access to invalide cache at this level
  //so we can easily invalidate the cache when refetch() is called
  const refetchSignal = useSignal(false);
  const refetch = $(() => {
    invalidateCacheByHref(href);
    refetchSignal.value = !refetchSignal.value;
  });

  const resource = useResource$<GetEndpointData<T>>(async ({ track }) => {
    // fetch() for new data when the pathname has changed
    track(() => loc.href);
    // fetch() for new data when user triggers a manual refetch() function
    track(() => refetchSignal.value);

    if (isServer) {
      if (!env) {
        throw new Error('Endpoint response body is missing');
      }
      return env.response.body;
    } else {
      const clientData = await loadClientData(href, fetchOptions);
      return clientData && clientData.body;
    }
  });

  return { resource, refetch }
};

export const invalidateCacheByHref = (href: string) => {
  const pagePathname = new URL(href).pathname;
  const endpointUrl = getClientEndpointPath(pagePathname);
  const index = cachedClientPages.findIndex((c) => c.u === endpointUrl);
  cachedClientPages.splice(index, 1);
}

export const loadClientData = async (href: string, fetchOptions: RequestInit) => {
  const { cacheModules } = await import('@qwik-city-plan');
  const pagePathname = new URL(href).pathname;
  const endpointUrl = getClientEndpointPath(pagePathname);
  const now = Date.now();
  const expiration = cacheModules ? 600000 : 15000;

  const cachedClientPageIndex = cachedClientPages.findIndex((c) => c.u === endpointUrl);

  let cachedClientPageData = cachedClientPages[cachedClientPageIndex];

  dispatchPrefetchEvent({
    links: [pagePathname],
  });

  if (!cachedClientPageData || cachedClientPageData.t + expiration < now) {
    cachedClientPageData = {
      u: endpointUrl,
      t: now,
      c: new Promise<ClientPageData | null>((resolve) => {
        fetch(endpointUrl, { ...fetchOptions }).then(
          (clientResponse) => {
            const contentType = clientResponse.headers.get('content-type') || '';
            if (clientResponse.ok && contentType.includes('json')) {
              clientResponse.json().then(
                (clientData: ClientPageData) => {
                  dispatchPrefetchEvent({
                    bundles: clientData.prefetch,
                    links: [pagePathname],
                    // qKeys: getDocumentQKeys(document),
                  });
                  resolve(clientData);
                },
                () => resolve(null)
              );
            } else {
              resolve(null);
            }
          },
          () => resolve(null)
        );
      }),
    };

    for (let i = cachedClientPages.length - 1; i >= 0; i--) {
      if (cachedClientPages[i].t + expiration < now) {
        cachedClientPages.splice(i, 1);
      }
    }
    cachedClientPages.push(cachedClientPageData);
  }

  cachedClientPageData.c.catch((e) => console.error(e));

  return cachedClientPageData.c;
};

export const getDocumentQKeys = (doc: Document) => {
  let comment: Comment | null | undefined;
  let data: string;
  let attrIndex: number;

  const walker = doc.createTreeWalker(doc, /* SHOW_COMMENT */ 128);
  const qKeys = new Set<string>();

  while ((comment = walker.nextNode() as any)) {
    data = comment.data;
    attrIndex = data.indexOf('q:key=');
    if (attrIndex > -1) {
      data = data.slice(attrIndex + 6);
      qKeys.add(data.slice(0, data.indexOf(':')));
    }
  }

  return Array.from(qKeys);
};

const cachedClientPages: CachedClientPageData[] = [];

interface CachedClientPageData {
  c: Promise<ClientPageData | null>;
  t: number;
  u: string;
}
