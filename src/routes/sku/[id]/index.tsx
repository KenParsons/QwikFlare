import { component$, Resource } from '@builder.io/qwik';
import { RequestHandler, useLocation } from "@builder.io/qwik-city"
import { useEndpoint } from '~/qwik-city/runtime/src';


export interface ProductDetails {
    title: string;
    description: string;
    price: string;
    timeStamp: string;
    random: number;
}

export const onGet: RequestHandler<ProductDetails> = async () => {
    //pretend database fetch
    const random = Math.random();
    return {
        title: "Serenity",
        description: "A moment of solace in today's crazy world",
        price: "Priceless",
        timeStamp: (new Date()).toLocaleTimeString(),
        random
    }
}

export interface PostResponse {
    success: boolean
    timeStamp: string;
}

export const onPost: RequestHandler<PostResponse> = async (event) => {
    // console.log(event);
    const body = await event.request.json();
    console.log(body)
    return {
        success: true,
        timeStamp: (new Date()).toLocaleTimeString()
    }
}

export default component$(() => {
    const productEndpoint = useEndpoint<typeof onGet>();
    const location = useLocation();

    return <div>
        <h1>SKU</h1>
        <p>Pathname: {location.pathname}</p>
        <p>Sku Id: {location.params.id}</p>

        <hr />
        <Resource value={productEndpoint.resource} onResolved={(data) => <ProductDisplay data={data} />} />
        <Resource value={productEndpoint.resource} onResolved={(data) => <div>
            Hi I'm also using the same data {data.timeStamp}
        </div>} />
        <button onClick$={() => {
            productEndpoint.refetch();
        }}>
            Refetch
        </button>
    </div>
});


export const ProductDisplay = component$(({ data }: { data: ProductDetails }) => {

    return <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
            <h1>{data.title}</h1>
            <h3>{data.description}</h3>
            <p>Last updated at {data.timeStamp}</p>

        </div>

        <p>{data.price}</p>
    </div>
})


