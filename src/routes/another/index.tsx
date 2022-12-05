import { route } from "~/qwik-city/runtime/src/library/routing";
import { component$ } from "~/qwik/packages/qwik/dist/core";


export default component$(() => {
    return <div>
        <a href={route("/article/[articleId]/[repo]", {
            articleId: 1231313,
            repo: "Qwik"
        })}>
            Click me!
        </a>
    </div>
})
