
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

export const onGet: RequestHandler<ProductDetails, PersonSearchInputs> = async (requestEvent) => {
    console.log('inputs', requestEvent.inputs)
    return {
        title: "Serenity" + " " + requestEvent.url,
        description: "A moment of solace in today's crazy world",
        price: "Priceless",
        timeStamp: (new Date()).toLocaleTimeString(),
        random: Math.random()
    }
}


export const onPost: RequestHandler<ProductDetails, { almostThere: string }> = async (requestEvent) => {
    // const { name, age } = requestEvent.inputs
    console.log(requestEvent.inputs)
    return {
        title: "Sasdfasdfasdf" + " " + requestEvent.url,
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

    const endpoint = useEndpoint("/sku/[id]", {
        inputs: {
            age: 2352,
            name: "Josh",
            test: { hi: "weee" }
        }
    });


    useClientEffect$(async () => {
        const data = await endpoint.resource.promise;

    })

    return <div>
        <h1>SKU</h1>
        <p>Pathname: {location.pathname}</p>
        <p>Sku Id: {location.params.id}</p>

        <hr />

        <div>
            <Resource value={endpoint.resource} onResolved={(data) => <ProductDisplay data={data} />} />
            <button onClick$={() => endpoint.refetch({
                method: "post", inputs: {
                    name: "asdfjasdfasdf", test: { hi: "weeeeee!" }, age: 324234
                }
            })}>
                Refetch post
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

