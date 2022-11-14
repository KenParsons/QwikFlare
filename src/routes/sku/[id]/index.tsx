
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

export interface PersonSearchInputs { name?: string, age?: number, notes?: string }

export const onGet: RequestHandler<ProductDetails, PersonSearchInputs> = async (requestEvent) => {
    const { name, age, notes } = requestEvent.inputs;
    return {
        title: "Serenity " + (name || ""),
        description: notes || "",
        price: "Age: " + (age || ""),
        timeStamp: (new Date()).toLocaleTimeString(),
        random: Math.random()
    }
}

export default component$(() => {
    const location = useLocation();
    const endpoint = useEndpoint("/sku/[id]", { method: "get", inputs: { name: "Josh", notes: "asdfasdf" } });

    useClientEffect$(async () => {
        const data = await endpoint.resource.promise;
        console.log(data);

    })


    return <div>
        <h1>SKU</h1>
        <p>Pathname: {location.pathname}</p>
        <p>Sku Id: {location.params.id}</p>

        <hr />

        <div>
            <Resource value={endpoint.resource} onResolved={(data) => <ProductDisplay data={data} />} />
            <button onClick$={() => endpoint.refetch({ inputs: { name: "hey", notes: "asdfasdf", } })}>
                Refetch no config
            </button>

            <button onClick$={() => endpoint.refetch({
                method: "get",
                inputs: {}
            })}>
                Refetch still get though, but new config
            </button>

        </div>
    </div>
});

export const ProductDisplay = component$(({ data }: { data: Partial<ProductDetails> }) => {
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

