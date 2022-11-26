import { RequestHandler } from "~/qwik-city/runtime/src";

export interface RouteParams {
    id: string;
}
 

export const onPost: RequestHandler<{ test: string }> = async () => {
    return { test: "From post: " + Math.random().toString() }
}
