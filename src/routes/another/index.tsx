import { route } from "~/qwik-city/runtime/src/library/routing";
import { component$ } from "~/qwik/packages/qwik/dist/core";

export default component$(() => {
    return <div>
        <a href={route("/article/[articleId]", {
            articleId: 234234234,
            description: "Hey!",
            userId: 23
        })}>
            Click me!
        </a>
    </div>
})
