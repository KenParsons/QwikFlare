import { RequestHandler } from "~/qwik-city/runtime/src";
import { route } from "~/qwik-city/runtime/src/library/routing";
import { PathParamsByRoute } from "~/route-types";
import { component$ } from "../../../qwik/packages/qwik/";

interface Response {
    serverMessage: string
}

type Params = RouteParams<"/random-number/[somethingParam]", {
    somethingParam: number;
}>

export const onGet: RequestHandler<Response, Params> = async (requestEvent) => {
    const test = requestEvent.params.
    return {
        serverMessage: `Random number response: ${Math.random()}`
    }
}









type RouteParams<
    Path extends keyof PathParamsByRoute,
    UserParams extends { [key: string]: any } & PathParamsByRoute[Path] extends null ? {} : PathParamsByRoute[Path]
> = UserParams
















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

