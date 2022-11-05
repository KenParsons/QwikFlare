import { component$, Resource, useClientEffect$, useStore } from '@builder.io/qwik';
import { RequestHandler, useEndpoint, useLocation } from '@builder.io/qwik-city';
import { onGet as getData, Response } from "./getData"

export const onGet: RequestHandler<Response> = async (request) => {
    return getData(request);
}


export default component$(() => {
    const productDetails = useEndpoint<typeof onGet>();
    const location = useLocation();

    return <div>
        <h1>SKU</h1>
        <p>Pathname: {location.pathname}</p>
        <p>Sku Id: {location.params.id}</p>
        <hr />
        <Resource value={productDetails} onResolved={(data) => <ProductDisplay data={data} />} />
    </div>
});


export const ProductDisplay = component$(({ data }: { data: Response }) => {
    const productData = useStore(data);

    useClientEffect$(({ cleanup }) => {
        const fetchInterval = setInterval(() => {
            fetch(window.location.pathname + "/getData").then(r => r.json()).then(response => {
                const getDataResponse = response as Response
                console.log(response);
                productData.timeStamp = getDataResponse.timeStamp
            })
        }, 10000);

        cleanup(() => { clearInterval(fetchInterval) });
    })

    return <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
            <h1>{productData.title}</h1>
            <h3>{productData.description}</h3>
            <p>Last updated at {productData.timeStamp}</p>
        </div>

        <p>{productData.price}</p>
    </div>
})
