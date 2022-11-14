
import { component$, Resource, useClientEffect$ } from "@builder.io/qwik"
import { useLocation } from '@builder.io/qwik-city';
import { RequestHandler, useEndpoint } from '~/qwik-city/runtime/src';

export interface ProductDetails {
    title: string;
    description: string;
    price: string;
    timeStamp: string;
    random: number;
}


export const onGet: RequestHandler<ProductDetails, { id: string }> = async (requestEvent) => {
    console.log(requestEvent);


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


    const endpoint = useEndpoint("/sku/[...id]", {
        method: "get",
        inputs: {
            id: "aswdfasdf"
        }
    });


    console.log(endpoint.resource.promise);

    useClientEffect$(async () => {
        const data = await endpoint.resource.promise;
        console.log(data)
    })

    return <div>
        <h1>SKU</h1>
        <p>Pathname: {location.pathname}</p>
        <p>Sku Id: {location.params.id}</p>

        <hr />

        <div>
            <Resource value={endpoint.resource} onResolved={(data) => <ProductDisplay data={data} />} />
            <button onClick$={() => endpoint.refetch()}>
                Refetch no config (will use initial config)
            </button>


            <div></div>
            <button onClick$={() => endpoint.refetch({ method: "get" })}>
                Refetch Post Request
            </button>
            <div></div>


        </div>


        <hr />
        {/* 
        <div>
            <Resource value={anotherEndpoint.resource} onResolved={(data) => <ProductDisplay data={data} />} />
            <button onClick$={() => anotherEndpoint.refetch()}>
                Refetch
            </button>
            <div></div>
        </div> */}

    </div>
});

export const ProductDisplay = component$(({ data }: { data: ProductDetails }) => {
    return <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
            <h1>Title: {data.title}</h1>
            <h3>Description: {data.description}</h3>
            <p>Last updated at {data.timeStamp}</p>

        </div>
        <div style={{ maxWidth: "40%" }}>
            <p>Price: {data.price}</p>
            <p>Raw data: <code>{JSON.stringify(data)}</code></p>
        </div>
    </div>
})

