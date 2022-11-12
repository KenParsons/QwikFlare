import { component$ } from "~/qwik/packages/qwik/dist/core";

// export const onGet: RequestHandler<{ test: number }> = async (requestEvent) => {
//     return { test: Math.random() }
// }

export default component$(() => {
    return <div>Hello World!</div>
})