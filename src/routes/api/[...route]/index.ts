import { RequestHandler } from "~/qwik-city/runtime/src";


// export const onGet: RequestHandler<{ test: number }> = async () => {
//     // const resource = useResource$(() => {
//     //     return "resource test"
//     // })
//     return { test: Math.random(), resource: "hi" }
// }

export const onPost: RequestHandler<{ test: string }> = async () => {
    return { test: "From post: " + Math.random().toString() }
}
