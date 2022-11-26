
import { RequestHandler, useEndpoint } from "~/qwik-city/runtime/src";
import { getPath } from "~/qwik-city/runtime/src/library/routing";
import { component$, Resource, useSignal } from "~/qwik/packages/qwik/dist/core";


interface Response {
    serverMessage: string;
}

interface Inputs {
    clientMessage: string
}

export const onGet: RequestHandler<Response, Inputs> = async (requestEvent) => {
    const { clientMessage } = requestEvent.inputs
    return {
        serverMessage: `Message from client: ${clientMessage}. Random number response: ${Math.random()}`
    }
}

export default component$(() => {
    const endoint = useEndpoint("/random-number", { method: "get", inputs: { clientMessage: "Hey!" } });
    const messageInput = useSignal("");
    return <div>
        <input value={messageInput.value} onInput$={(event) => {
            const target = event.target as HTMLInputElement;
            messageInput.value = target.value
        }}>
        </input>
        <p>{getPath("/users/[recordId]/[propertyId]/get", {
            "[propertyId]": "2323fssdf",
            "[recordId]": "record2139203",
            sampleObject: { 
                testNumber: 234242,
                testString: "finish line!"
            }
        })}</p>
        <button
            onClick$={() => endoint.call({ inputs: { clientMessage: messageInput.value } })}
            style={{ display: "block" }}>
            Refresh
        </button>
        <p>The server responded with:</p>
        <Resource value={endoint.resource} onResolved={(data) => <p>{data.serverMessage}</p>} />
    </div>
})