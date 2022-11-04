import { component$, Resource, useServerMount$, useSignal } from '@builder.io/qwik';
import { RequestHandler, useEndpoint, useLocation } from '@builder.io/qwik-city';

interface Response {
    host: string;
}

export const onGet: RequestHandler<Response> = async (request) => {
    const host = request.request.headers.get("host") || "unknown";
    console.log(host);

    return {
        host
    }
}

export default component$(() => {
    const data = useEndpoint<typeof onGet>();
    const clientData = useSignal<Response>();
    useServerMount$(async () => {
        clientData.value = (await data.promise);
    });
    const location = useLocation();

    return (
        <div>
            <h1>SKU</h1>
            <p>Pathname: {location.pathname}</p>
            <p>Sku Id: {location.params.skuId}</p>
            {clientData.value && <h2>Hi {clientData.value.host}</h2>}
        </div>
    );
});