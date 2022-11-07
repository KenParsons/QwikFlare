
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

export default component$(() => {
    const productEndpoint = useEndpoint<typeof onGet>();
    const location = useLocation();


    useClientEffect$(() => {
        const interval = setInterval(() => {
            productEndpoint.refetch();
        }, 10000)
        return () => { clearInterval(interval) }
    })

    return <div>
        <h1>SKU</h1>
        <p>Pathname: {location.pathname}</p>
        <p>Sku Id: {location.params.id}</p>

        <hr />
        <Resource value={productEndpoint} onResolved={(data) => <ProductDisplay data={data} />} />
        <Resource value={productEndpoint} onResolved={(data) => <div>
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


