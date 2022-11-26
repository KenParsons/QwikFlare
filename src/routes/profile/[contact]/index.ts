import { RequestHandler } from "~/qwik-city/runtime/src";

export interface RouteParams {
    id: number;
    name: string;
    tags: string[];
}

// export const onGet: RequestHandler<{ test: number }> = async () => {
//     // const resource = useResource$(() => {
//     //     return "resource test"
//     // })
//     return { test: Math.random(), resource: "hi" }
// }

export const onPost: RequestHandler<{ test: string }> = async () => {
    return { test: "From post: " + Math.random().toString() }
}
