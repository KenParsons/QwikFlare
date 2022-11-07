import {
    $,
    noSerialize,
    useEnvData,
    useResource$,
    useSignal,
} from '@builder.io/qwik';
import {
    RequestHandler,
    RouteParams,
    useLocation,
} from '@builder.io/qwik-city';
import { isServer } from '@builder.io/qwik/build';

export const useEndpoint = <T = unknown>() => {
    const loc = useLocation();
    const env = useQwikCityEnv();
    const refetchSignal = useSignal(false);
    const refetch = $(() => {
        refetchSignal.value = !refetchSignal.value;
    });

    const resource = useResource$<GetEndpointData<T>>(async ({ track }) => {
        const href = track(() => loc.href);
        track(() => refetchSignal.value);

        if (isServer) {
            if (!env) {
                throw new Error('Endpoint response body is missing!');
            }

            return env.response.body;
        } else {
            const clientData = await loadClientData(href);
            return clientData && clientData.body;
        }
    });

    // return { ...resource, refresh };
    return { resource, refetch };
};

export type GetEndpointData<T> = T extends RequestHandler<infer U> ? U : T;

interface QwikCityEnvData {
    params: RouteParams;
    response: EndpointResponse;
}

export const useQwikCityEnv = () =>
    noSerialize(useEnvData<QwikCityEnvData>('qwikcity'));

export const loadClientData = async (href: string) => {
    const pagePathname = new URL(href).pathname;
    const endpointUrl = getClientEndpointPath(pagePathname);

    dispatchPrefetchEvent({
        links: [pagePathname],
    });

    const clientResponse = await fetch(endpointUrl);
    const contentType = clientResponse.headers.get('content-type') || '';
    if (clientResponse.ok && contentType.includes('json')) {
        const clientData: ClientPageData = await clientResponse.json();
        dispatchPrefetchEvent({
            bundles: clientData.prefetch,
            links: [pagePathname],
        });
        return clientData;
    }
};

interface ClientPageData extends Omit<EndpointResponse, 'status'> {
    status?: number;
    prefetch?: string[];
    redirect?: string;
    isStatic: boolean;
}

interface EndpointResponse {
    body: any;
    status: number;
}

function getClientEndpointPath(pathname: string) {
    return pathname + (pathname.endsWith('/') ? '' : '/') + 'q-data.json';
}

function dispatchPrefetchEvent(prefetchData: QPrefetchData) {
    if (typeof document !== 'undefined') {
        document.dispatchEvent(
            new CustomEvent('qprefetch', { detail: prefetchData })
        );
    }
}

interface QPrefetchData {
    links?: string[];
    bundles?: string[];
    symbols?: string[];
}
