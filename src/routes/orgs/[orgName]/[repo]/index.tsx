import { useEndpoint } from "~/qwik/packages/qwik-city/lib";
import { component$, Resource } from "~/qwik/packages/qwik/dist/core";
import { createParamsValidator, handler } from "~/typed-routing/helpers";

const paramsValidator = createParamsValidator("/orgs/[orgName]/[repo]/", {
    //the following two will be required because [orgName] and [repo] are in the path
    orgName: "string",
    repo: "string",

    //added support for the following syntax, so the question mark looks more like Typescript
    //also will allow us to do optional object/arrays in the future without needing validator function
    //Note that in the params (including the type!) it's converted back to .test, not ["test?"]
    "test?": "string",

    //so we could remove this following syntax if we want. leaving both for now
    anotherTest: "string?"
});

export const onGet = handler(paramsValidator, (requestEvent) => {
    
    return {
        message: "You did it!",
        params: requestEvent.params
    }
})


export default component$(() => {
    const endpoint = useEndpoint<typeof onGet>();

    return <Resource value={endpoint} onResolved={(data) => {
        return <div>
            {data.message}
            <br />
            {JSON.stringify(data.params)}
        </div>
    }} />
})

