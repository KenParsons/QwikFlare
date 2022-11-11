import { RequestHandler } from "~/qwik-city/runtime/src";
import { component$ } from "~/qwik/packages/qwik/dist/core";

export const onGet: RequestHandler<any> = async (requestEvent) => { 
    return requestEvent
}

export default component$(()=> { 
    return <div>Hello World!</div>
})