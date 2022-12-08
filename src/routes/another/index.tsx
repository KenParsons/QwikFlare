import { component$ } from "~/qwik/packages/qwik/dist/core";
import { route } from "~/typed-routing/helpers";


export default component$(() => {
    return <div>
        <a href={route("/product/[productId]", {
            productId: "heyeh"
        })}>
            Click me!
        </a>
    </div>
})
