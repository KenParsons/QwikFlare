import { RequestHandler, useEndpoint } from "~/qwik-city/runtime/src";
import { route } from "~/qwik-city/runtime/src/library/routing";
import { PathParamsByRoute } from "~/route-types";
import { component$ } from "../../../qwik/packages/qwik/";

interface Response {
    serverMessage: string;
    test: { 
        nested: Date;
    };
}

export const onGet: RequestHandler<Response> = async (requestEvent) => {

    return {
        serverMessage: `Random number response: ${Math.random()}`,
        test: { 
            nested: new Date()
        }
    }
}



const returnValue = onGet({});












type Params = RouteParams<"/random-number/[somethingParam]", {
    somethingParam: number;
}>




















export default component$(() => {
    const endpoint = useEndpoint("/random-number/[somethingParam]")
    endpoint.resource.promise.then(data => {
        data.serverMessage
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



