import { RoutesThatUseThisOnGetHandler } from "~/endpoint-types copy";
import { RequestHandler } from "~/qwik-city/runtime/src";
import { route } from "~/qwik-city/runtime/src/library/routing";
import { component$ } from "~/qwik/packages/qwik/dist/core";


export interface Response {
    serverMessage: string;
}



export const onGet: RequestHandler<Response, {
    clientMessage: string;
    somethingElse: number;
    somethingParam: number;
}> = async (requestEvent) => {
    
    console.log(requestEvent.params.somethingParam);
    return {
        serverMessage: `Random number response: ${Math.random()}`
    }
}

const test: RoutesThatUseThisOnGetHandler<onGet>


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

 