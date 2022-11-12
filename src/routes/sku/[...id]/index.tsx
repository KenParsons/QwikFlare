
import { component$, Resource } from "@builder.io/qwik"
import { useLocation } from '@builder.io/qwik-city';
import { RequestHandler, useEndpoint } from '~/qwik-city/runtime/src';


export interface ProductDetails {
    title: string;
    description: string;
    price: string;
    timeStamp: string;
    random: number;

}

export const onGet: RequestHandler<ProductDetails> = async (request) => {
    //pretend database fetch
    console.log(request);
    return {
        title: "Serenity",
        description: "A moment of solace in today's crazy world",
        price: "Priceless",
        timeStamp: (new Date()).toLocaleTimeString(),
        random: Math.random(),
    }
}


export const onPost: RequestHandler<ProductDetails> = async (request) => {
    //pretend database fetch
    console.log(request);
    return {
        title: "Serenity",
        description: "A moment of solace in today's crazy world",
        price: "Priceless",
        timeStamp: (new Date()).toLocaleTimeString(),
        random: Math.random(),
    }
}

export default component$(() => {
    const location = useLocation();
    const endpoint = useEndpoint("/sku/[...id]", { method: "post" });


    return <div>
        <h1>SKU</h1>
        <p>Pathname: {location.pathname}</p>
        <p>Sku Id: {location.params.id}</p>

        <hr />
        <div>
            <Resource value={endpoint.resource} onResolved={(data) => <ProductDisplay data={data} />} />
            <button onClick$={() => endpoint.refetch()}>
                Refetch
            </button>
        </div>
    </div>
});

/*
<Resource value={endpoint.resource} onResolved={(data) => <div>
                Hi I'm also using the same data {data.timeStamp} - {data.random}
                <p>Headers: {data.headers}</p> }
                </div>}
                />
*/

// 
export const ProductDisplay = component$(({ data }: { data: ProductDetails }) => {
    return <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
            <h1>Title: {data.title}</h1>
            <h3>Description: {data.description}</h3>
            <p>Last updated at {data.timeStamp}</p>

        </div>
        <div style={{ maxWidth: "40%" }}>
            <p>{data.price}</p>
            <p>Raw data: {JSON.stringify(data)}</p>
        </div>
    </div>
})

