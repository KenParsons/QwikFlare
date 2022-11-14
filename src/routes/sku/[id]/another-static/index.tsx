
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

export interface PersonSearchInputs { name?: string, age?: number }

export const onGet: RequestHandler<ProductDetails> = async (requestEvent) => {
    // console.log(requestEvent.url);
    const test = requestEvent.url

    return {
        title: "Serenity" + " " + test,
        description: "A moment of solace in today's crazy world",
        price: "Priceless",
        timeStamp: (new Date()).toLocaleTimeString(),
        random: Math.random()
    }
}


export const onPost: RequestHandler<ProductDetails, PersonSearchInputs> = async (requestEvent) => {
    // const { name, age } = requestEvent.inputs

    return {
        title: "Sasdfasdfasdf",
        description: "2fhawfj",
        price: "$12389128",
        timeStamp: (new Date()).toLocaleTimeString(),
        random: Math.random()
    }
}



export default component$(() => {
    const location = useLocation();

    const userFirstName = "Marcos"
    const userAge = 23423



    const endpoint = useEndpoint("/sku/[id]/static", {
        method: "get",
        inputs: { name: "josh", age: 238428 }
    });


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

        </div>
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

