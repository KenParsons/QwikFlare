import { RequestHandler } from "@builder.io/qwik-city";
import { PostResponse } from "..";

export const onGet: RequestHandler<PostResponse> = async (event) => {

    return {
        success: true,
        timeStamp: (new Date()).toLocaleTimeString()
    }
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