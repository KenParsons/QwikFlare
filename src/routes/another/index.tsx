import { component$ } from "~/qwik/packages/qwik/dist/core";
import { route } from "~/typed-routing/helpers";


export default component$(() => {
    return <div>
        <a href={route("/orgs/[orgName]/[repo]/", {
            orgName: "Test",
            repo: "13131231",
        })}>
            Click me!
        </a>
    </div>
})
