import { $, useResource$, useSignal } from '@builder.io/qwik';
import { useLocation, useQwikCityEnv, } from './use-functions';
import { isServer } from '@builder.io/qwik/build';
import type { ClientPageData, GetEndpointData, EndpointMethodInputs, RouteLocation } from './types';
import { getClientEndpointPath } from './utils';
import { dispatchPrefetchEvent } from './client-navigate';
import { getOnMethodsByPath } from '~/getOnMethodsByPath';
import { Endpoints, HandlerTypesByEndpointAndMethod } from '~/endpointTypes';
import { url } from 'inspector';


type InputsIfExists<T> = T extends { [key: string]: any } ? { inputs: T } : {};
/**
 * @alpha
 */
export const useEndpoint = <
    Endpoint extends Endpoints,
    Method extends keyof HandlerTypesByEndpointAndMethod[Endpoint],
    Inputs extends EndpointMethodInputs<HandlerTypesByEndpointAndMethod[Endpoint][Method]>
>
    (
        route?: Endpoint,
        config?: {
            method?: Method,
            body?: string //We Omit below and add it here because otherwise it's the non-serializable ReadableStream
        }
            & InputsIfExists<Inputs>
            & Omit<RequestInit, "method" | "body">,
    ) => {

    const env = useQwikCityEnv();
    const loc = useLocation();
    const origin = new URL(loc.href).origin
    const targetHref = route ? (origin + route) : loc.href;

    const refetchSignal = useSignal(false);

    type RefetchConfig = {
        method?: Method,
        body?: string
    } & InputsIfExists<Inputs>
        & Omit<RequestInit, "method" | "body">

    const refetchConfig = useSignal<null | RefetchConfig>(null);
    const refetch = $((thisConfig: RefetchConfig) => {
        if (thisConfig) { refetchConfig.value = thisConfig }
        invalidateCacheByHref(targetHref);
        refetchSignal.value = !refetchSignal.value;
    });


    const resource = useResource$<GetEndpointData<HandlerTypesByEndpointAndMethod[Endpoint][Method]>>(async ({ track }) => {
        const configToUse = refetchConfig.value || config;
        //this should only be necessary client side, right? could probably move it down to that else block 

        // fetch() for new data when the pathname has changed
        track(() => targetHref);
        // fetch() for new data when user triggers a manual refetch() function
        track(() => refetchSignal.value);

        const sameRoute = isSameRoute(route!, loc.pathname)

        if (isServer) {
            if (!env) {
                throw new Error('Endpoint response body is missing');
            }

            if (!sameRoute) {
                const onMethodsByPath = await getOnMethodsByPath();
                const thisPathMethods = onMethodsByPath[route!];

                const thisMethodString = configToUse?.method ? configToUse.method.toString() : "";
                const thisHandlerKey = thisMethodString ? ("on" + thisMethodString[0].toUpperCase() + thisMethodString.slice(1)) : null;

                const handlerKey = (thisHandlerKey || "onGet") as keyof typeof thisPathMethods;
                const handler = thisPathMethods[handlerKey] || thisPathMethods?.onRequest;
                if (handler) {
                    return handler({ request: { headers: { "Direct from SSR": true } } });
                    //TODO: Check if env. has the request information somewhere, the same way we have the response to return below.
                    //If not, add it. Then use it here. We'd want to pass along the original request context like headers
                    //the above argument passed into handler() is just a filler
                    //adding query params in to url is good idea as well? have to preserve them somehow.
                } else {
                    warnInvalidPathAndMethod(targetHref, handlerKey, config)
                }
            }
            return env.response.body;

        } else {
            const hrefToUse = sameRoute ? loc.href : targetHref; //preserve route & query params if fetching data from same page currently located on
            const clientData = await loadClientData(hrefToUse, configToUse);
            refetchConfig.value = null;
            return clientData && clientData.body || clientData;
        }
    });

    return { resource, refetch }
};

export const warnInvalidPathAndMethod = (targetHref: string, handlerKey: string, config: any) => {
    console.warn(`
⚠ WARNING - useEndpoint() ⚠ 
Attempting to access an invalid route + method: ${targetHref} + ${handlerKey}.
${config ? '' : '⛔ No configuration was used, so onGet was used as default.\nIf this route has no onGet, be sure to use a config (passed as 2nd argument) ⛔'}
Falling back to the response data of the current page.`);
}

export const isSameRoute = (targetPath: string, currentPath: string) => {
    /*
        NOTE: There may be a more Qwikified way of doing this, but this is the dumb brute solution:
        We need to know if they're requesting a route via useEndpoint that is the route they're already on.
        However, simple equality of targetPath === location.pathname won't hold up because of dynamic routes.

    */
    const targetChunks = targetPath.split("/").filter(chunk => chunk);
    const currentChunks = currentPath.split("/").filter(chunk => chunk);
    //the filter is beacuse there are often empty strings left over on either side. those shouldn't affect comparison

    const maxChunks = Math.max(targetChunks.length, currentChunks.length);
    for (let i = 0; i < maxChunks; i++) {
        const thisTargetChunk = targetChunks[i];
        if (!thisTargetChunk) {
            /*if we're still iterating but no more target chunks exist, then we're at a deeper route
            than our target route - not a direct match. We can't simply compare length and return
            false if different because of the nature of catch-all routes */
            return false;
        }

        const isCatchAll = thisTargetChunk.startsWith("[...");
        if (isCatchAll) {
            return true;
            //everything else in current route will be "caught". counts as a match.
        }

        const isRouteParam = !isCatchAll && thisTargetChunk.startsWith("[");
        if (isRouteParam) {
            continue;
            //this particular chunk can be anything, but subsequent chunks in the path still need to match up
        }

        const thisCurrentChunk = currentChunks[i];
        if (thisTargetChunk !== thisCurrentChunk) {
            return false
        }
    }
    return true;
}

export const invalidateCacheByHref = (href: string) => {
    const pagePathname = new URL(href).pathname;
    const endpointUrl = getClientEndpointPath(pagePathname);
    const index = cachedClientPages.findIndex((c) => c.u === endpointUrl);
    cachedClientPages.splice(index, 1);
}

export const loadClientData = async (href: string, config?: any) => {

    const { cacheModules } = await import('@qwik-city-plan');
    const urlFromHref = new URL(href);
    const pagePathname = urlFromHref.pathname;
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
                //TODO: config will not be 1 to 1 to fetch's settings, so a conversion has to happen;
                //We'll pass the search in because that will only exist we're fetching the same location that we're on. 
                //And even still, any inputs from the config should override those since they were explicitly requested in useEndpoint. 
                let queryParams = "?";
                if (!config?.method || config.method === "get" || config.method === "request") {
                    config = config || {}
                    config.inputs = config.inputs || {};
                    urlFromHref.searchParams.forEach((value, key) => {
                        //note that we're checking that it's not already on config, thus deferring to config first
                        if (!config.inputs[key]) config.inputs[key] = value;
                    })
                    for (const key in config.inputs) {
                        const value = config.inputs[key];
                        const stringified = (typeof (value) === "object") ? JSON.stringify(value) : value;
                        queryParams += `${key}=${stringified}&`
                    }
                    queryParams = queryParams.slice(0, -1) //trailing &
                } else {
                    queryParams = urlFromHref.search
                    config.body = JSON.stringify(config.inputs);
                }

                fetch(endpointUrl + queryParams, { ...config }).then(
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
