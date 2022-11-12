import { RequestHandler } from "~/qwik-city/runtime/src";


export const onGet: RequestHandler<{ test: number }> = async () => {
    return { test: Math.random() }
}

export const onPost: RequestHandler<{ test: string }> = async () => {
    return { test: "from post " + Math.random().toString() }
}
