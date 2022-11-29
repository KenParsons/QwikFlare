import { RequestHandler, useEndpoint } from "~/qwik-city/runtime/src";
import { route } from "~/qwik-city/runtime/src/library/routing";
import { PathParamsByRoute } from "~/route-types";
import { component$ } from "../../../qwik/packages/qwik/";

type Response = {
    test: "simple string value",
    date: Date
}

//SHOULD ERROR, invalid JSON value
export const onGet: RequestHandler<Response> = async (requestEvent) => {
    return {
        test: "simple string value",
        date: new Date()
    }
}

//SHOULD ERROR. Didn't try to return nonJSON, but didn't provide all keys described in Response
export const onGet1: RequestHandler<Response> = async (requestEvent) => {
    return {
        test: "simple string value",
    }
}

type Response2 = {
    test: "simple string value"
}

//Valid. No error should show. 
export const onGet2: RequestHandler<Response2> = async (requestEvent) => {
    return {
        test: "simple string value"
    }
}

//SHOULD ERROR, missing the test k:v pair
export const onGet3: RequestHandler<Response2> = async (requestEvent) => {
    return {
        imwrong: "the key should have been test"
    }
}

type Response3 = "just a pure string sent back, not wrapped in an object"

//SHOULD error, returning object instead of string
export const onGet4: RequestHandler<Response3> = async (requestEvent) => {
    return {
        test: "just a pure string sent back, not wrapped in an object"
    }
}

//Valid. No error should show
export const onGet5: RequestHandler<Response3> = async (requestEvent) => {
    return "just a pure string sent back, not wrapped in an object"
}


interface ResponseInterface {
    test: "simple string value",
    date: Date
}

//SHOULD ERROR, invalid JSON value
export const onGet6: RequestHandler<ResponseInterface> = async (requestEvent) => {
    return {
        test: "simple string value",
        date: new Date()
    }
}

//SHOULD ERROR. Didn't try to return nonJSON, but didn't provide all keys described in Response
export const onGet7: RequestHandler<ResponseInterface> = async (requestEvent) => {
    return {
        test: "simple string value",
    }
}


interface ResponseInterface2 {
    test: "simple string value"
}

//Valid. No error should show. 
export const onGet8: RequestHandler<ResponseInterface2> = async (requestEvent) => {
    return {
        test: "simple string value"
    }
}

interface ResponseInterface3 {
    test: string,
    moreData: number,
    nested: { 
        isNested: boolean,
        name: string
    }
}

//SHOULD error, missing keys
export const onGet9: RequestHandler<ResponseInterface3> = async (requestEvent) => {
    return {
        test: "simple string value"
    }
}

//Valid. No error should show.
export const onGet10: RequestHandler<ResponseInterface3> = async (requestEvent) => {
    return {
        test: "simple string value",
        moreData: 28238,
        nested: { 
            isNested: true,
            name: "oay then"
        },
    }
}
















const returnValue = onGet({});












type Params = RouteParams<"/random-number/[somethingParam]", {
    somethingParam: number;
}>




















export default component$(() => {
    const endpoint = useEndpoint("/random-number/[somethingParam]")
    endpoint.resource.promise.then(data => {
        data.
    })

    return <div>
        <p>
            {route("/random-number/[somethingParam]", {
                "[somethingParam]": "heyey",
                clientMessage: "hasdfasdf",
                somethingElse: 23235,
                somethingParam: 234234
            })}
        </p>
    </div>
})






















type RouteParams<
    Path extends keyof PathParamsByRoute,
    UserParams extends { [key: string]: any } & PathParamsByRoute[Path] extends null ? {} : PathParamsByRoute[Path]
> = UserParams



