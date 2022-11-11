import { $, noSerialize, useEnvData, useResource$, useSignal } from '@builder.io/qwik';
import { useLocation, } from './use-functions';
import { isServer } from '@builder.io/qwik/build';
import type { ClientPageData, GetEndpointData, QwikCityEnvData } from './types';
import { getClientEndpointPath } from './utils';
import { dispatchPrefetchEvent } from './client-navigate';
import { getOnMethodsByPath } from '~/getOnMethodsByPath';
import { Endpoints } from '~/endpointTypes';
import { HandlerTypesByEndpointAndMethod } from '~/_endpointTypes';


export const useQwikCityEnv = () => {
    return noSerialize(useEnvData<QwikCityEnvData>('qwikcity'))
};


/**
 * @alpha
 */
export const useEndpoint = <T extends Endpoints>(route?: T) => {
    const env = useQwikCityEnv();
    const loc = useLocation();
    const origin = new URL(loc.href).origin
    const targetHref = route ? (origin + route) : loc.href;

    const refetchSignal = useSignal(false);
    const refetch = $(() => {
        invalidateCacheByHref(targetHref);
        refetchSignal.value = !refetchSignal.value;
    });

    const resource = useResource$<GetEndpointData<HandlerTypesByEndpointAndMethod[`${T}.${"onGet"}`]>>(async ({ track }) => {
        // fetch() for new data when the pathname has changed
        track(() => targetHref);
        // fetch() for new data when user triggers a manual refetch() function
        track(() => refetchSignal.value);

        if (isServer) {
            if (!env) {
                throw new Error('Endpoint response body is missing');
            }

            if (loc.href !== targetHref) {
                const onMethodsByPath = await getOnMethodsByPath();
                const thisPathMethods = onMethodsByPath[route!];
                const handler = thisPathMethods?.onGet || thisPathMethods?.onRequest;
                if (handler) {
                    //TODO: Check if env. has the request information somewhere, the same way we have the response to return below.
                    //If not, add it. Then use it here. We'd want to pass along the original request context like headers
                    //the following argument passed into handler() is just a filler
                    return handler({ request: { headers: { "Direct from SSR": true } } });
                } else {
                    throw new Error(`Attempting to access a route without a handler: ${targetHref}`)
                }
            }
            return env.response.body;

        } else {
            const clientData = await loadClientData(targetHref);
            return clientData && clientData.body || clientData;
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

export const loadClientData = async (href: string) => {
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
                fetch(endpointUrl).then(
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
