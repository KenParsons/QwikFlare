import { RoutesThatUseThisOnGetHandler } from "~/endpoint-types copy";
import { RequestHandler } from "~/qwik-city/runtime/src";
import { route } from "~/qwik-city/runtime/src/library/routing";
import { component$ } from "~/qwik/packages/qwik/dist/core";
import { PathParamsByRoute } from "~/route-types";


export interface Response {
    serverMessage: string;
}



export const onGet: RequestHandler<Response, {
    clientMessage: string;
    somethingElse: number;
}> = async (requestEvent) => {
    
    
    return {
        serverMessage: `Random number response: ${Math.random()}`
    }
}




const test2: PathParamsByRoute[RoutesThatUseThisOnGetHandler<typeof onGet>] = {
    "[somethingParam]": "ASDFASDF"
}
console.log(test2);


export default component$(() => {
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

