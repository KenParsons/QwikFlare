import { RequestHandler } from "@builder.io/qwik-city";

export interface Response {
    title: string;
    description: string;
    price: string;
    timeStamp: string;
}

export const onGet: RequestHandler<Response> = async () => {
    //pretend database fetch
    return {
        title: "Serenity",
        description: "A moment of solace in today's crazy world",
        price: "Priceless",
        timeStamp: (new Date()).toLocaleTimeString()
    }
}