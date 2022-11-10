
import { component$, Resource, } from "@builder.io/qwik"
import { RouteLocation, useLocation } from '@builder.io/qwik-city';
import { mapOnMethods } from "~/mapOnMethods";
import { RequestHandler, useEndpoint } from '~/qwik-city/runtime/src';
import { useClientEffect$ } from "~/qwik-city/runtime/src/core";
import { onGet as flowersGet } from "~/routes/flower";

export interface ProductDetails {
    title: string;
    description: string;
    price: string;
    timeStamp: string;
    random: number;
    headers: string;
}

export const onPost: RequestHandler<any> = async (request) => {

}

export const onGet: RequestHandler<ProductDetails> = async (request) => {
    //pretend database fetch
    const headers: any = {}
    request.request.headers.forEach((value, key) => {
        headers[key] = value;
    })
    return {
        title: "Serenity",
        description: "A moment of solace in today's crazy world",
        price: "Priceless",
        timeStamp: (new Date()).toLocaleTimeString(),
        random: Math.random(),
        headers: JSON.stringify(headers)
    }
}

export default component$(() => {
    const productEndpoint = useEndpoint<typeof onGet>();

    let location: RouteLocation = {
        pathname: "I made it up",
        params: {
            id: "Also made it up"
        },
        href: "",
        query: {}
    }
    if (Math.random() > 0.5) {
        location = useLocation();
    }

    mapOnMethods();

    return <div>
        <h1>SKU</h1>
        <p>Pathname: {location.pathname}</p>
        <p>Sku Id: {location.params.id}</p>

        <hr />
        <Resource value={productEndpoint} onResolved={(data) => <ProductDisplay data={data} />} />
        <Resource value={productEndpoint} onResolved={(data) => <div>
            Hi I'm also using the same data {data.timeStamp}
            <p>Headers: {data.headers}</p>
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


