import { RequestHandler } from "~/qwik-city/runtime/src";
import { route } from "~/qwik-city/runtime/src/library/routing";
import { component$ } from "~/qwik/packages/qwik/dist/core";

console.log(import.meta.url);

export interface Response {
    serverMessage: string;
}

export type RequiredQueryParams = {
    clientMessage: string;
    somethingElse: number;
}

export type PathParam = number;

export const onGet: RequestHandler<Response, RequiredQueryParams> = async (requestEvent) => {
    requestEvent.params;
    console.log(requestEvent.params.somethingParam);
    return {
        serverMessage: `Random number response: ${Math.random()}`
    }
}


export default component$(() => {
    return <div>
        <p>
            {route("/random-number/[somethingParam]", {
                "[somethingParam]": "heyey",
                clientMessage: "hasdfasdf",
                somethingElse: 23235
            })}
        </p>
    </div>
})



type functionType = (param: "teehee") => number
type functionType2 = (param: "oohaha") => number
type functionType3 = (param: "help") => number




type MagicMap = {

}



const test: functionType = (arg) => { 
    
    return 3
}

 