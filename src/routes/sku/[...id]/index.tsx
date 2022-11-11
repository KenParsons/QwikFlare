
import { component$, Resource, } from "@builder.io/qwik"
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

export default component$(() => {
    const thisEndpoint = useEndpoint<typeof onGet>();
    const anotherEndpoint = useEndpoint("/plainPage");

    const location = useLocation();

    return <div>
        <h1>SKU</h1>
        <p>Pathname: {location.pathname}</p>
        <p>Sku Id: {location.params.id}</p>

        <hr />
        <DisplayContainer endpoint={thisEndpoint} />
        <hr />
        <DisplayContainer endpoint={anotherEndpoint} />
    </div>
});

export const DisplayContainer = component$(({ endpoint }: { endpoint: any }) => {
    return <div>
        <Resource value={endpoint} onResolved={(data) => <ProductDisplay data={data} />} />
        <Resource value={endpoint} onResolved={(data) => <div>
            Hi I'm also using the same data {data.timeStamp}
            {/* <p>Headers: {data.headers}</p> */}
        </div>} />
        <button onClick$={() => {
            endpoint.refetch();
        }}>
            Refetch
        </button>
    </div>
})

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


