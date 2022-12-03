import { RequestHandler, useEndpoint } from "~/qwik-city/runtime/src";
import { route } from "~/qwik-city/runtime/src/library/routing";
import { PathParamsByRoute } from "~/route-types";
import { component$ } from "../../../qwik/packages/qwik/";

type Response = {
    test: "simple string value",
    date: Date
}
















export default component$(() => {
    const endpoint = useEndpoint("/random-number/[somethingParam]")
    endpoint.resource.promise.then(data => {
        data
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



