
import { component$, Resource, useClientEffect$, useSignal, useWatch$ } from "@builder.io/qwik";
import { RequestHandler, useLocation } from '~/qwik-city/runtime/src';
import { useEndpoint } from "~/qwik-city/runtime/src/library/use-endpoint";

type UserProfile = { firstName: string, likes: string[], dislikes: string[] }

async function getUserProfile(username?: string, id?: string): Promise<UserProfile | null> {
    const users: { [key: string]: UserProfile } = {
        "josh.man83": {
            firstName: "Josh",
            likes: ["Vanilla Ice Cream", "Cats", "Hiking"],
            dislikes: ["Cold weather", "Politics", "Swimming"]
        },
        "autumnshowers": {
            firstName: "Irida",
            likes: ["Art", "Scary movies"],
            dislikes: ["Loud noises", "Dance clubs"]
        },
        "BigVik": {
            firstName: "Viktor",
            likes: ["Working out", "Philosophy"],
            dislikes: ["Busy malls", "Shopping for cars"]
        },
        "482190834": {
            firstName: "Shandra",
            likes: ["Long concerts", "Practical jokes", "3am gas station runs"],
            dislikes: ["Quiet mornings", "School", "Fancy restaurants"]
        },
    }

    const user = users[username!] || users[id!];
    return user || null;
}

export interface PublicProfile {
    firstName: string;
    likes: string[];
    dislikes: string[];
    lastRetrieved: string;
    requestId: number;
}

export interface UserSearchInputs { username: string, id?: string }

export const onGet: RequestHandler<PublicProfile, UserSearchInputs> = async (requestEvent) => {
    const { username, id } = requestEvent.inputs;
    requestEvent.inputs;

    const userProfile = await getUserProfile(username, id);
    return {
        firstName: userProfile?.firstName || "No user found",
        likes: userProfile?.likes || [],
        dislikes: userProfile?.dislikes || [],
        lastRetrieved: (new Date()).toLocaleTimeString(),
        requestId: Math.random() * 1000
    }
}

export default component$(() => {
    const location = useLocation();
    console.log('location query', location.query)

    const accountInfoEndpoint = useEndpoint("/find-user", { method: "get", inputs: { username: "josh.man83" } });
    const accountInfoEndpoint2 = useEndpoint("/find-user", { method: "get", inputs: { username: "" } });

    const userSearchInput = useSignal("");
    // useWatch$(async ({ track }) => {
    //     track(() => updateAccountEndpoint.resource.promise);
    //     console.log('update resource changed')
    //     await updateAccountEndpoint.resource.promise
    //     accountInfoEndpoint.call();
    // })

    return <div>
        <div>
            <span>Find a user:</span>
            <input
                style={{ margin: "0px 5px" }}
                value={userSearchInput.value}
                onInput$={(event) => {
                    const target = event.target as HTMLInputElement;
                    userSearchInput.value = target.value;
                }}>
            </input>

            <button onClick$={() => {
                accountInfoEndpoint.call({ inputs: { username: userSearchInput.value } })
            }}>
                Find user
            </button>

            {accountInfoEndpoint.hasBeenCalled ?
                <>
                    <Resource value={accountInfoEndpoint.resource} onResolved={(data) => <PublicProfileDisplay data={data} />} />
                    <Resource value={accountInfoEndpoint2.resource} onResolved={(data) => <div>  {data.lastRetrieved} + {data.requestId}  </div>} />
                </>
                : <p>Please search for a user</p>
            }
        </div>
    </div >
});



export const PublicProfileDisplay = component$(({ data }: { data: PublicProfile }) => {

    return <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <div>
            <h1>Name: {data.firstName}</h1>
            {data.likes.length > 0 && <>  <h3>Likes:</h3>   <div> {data.likes.map(like => <p>{like}</p>)}  </div>   </>}
            {data.dislikes.length > 0 && <><h3>Dislikes:</h3><div> {data.dislikes.map(dislike => <p>{dislike}</p>)}</div></>}
            <hr />
            <p>Last retrieved at {data.lastRetrieved}</p>
            <p style={{ fontSize: "10px" }}>Request ID: {data.requestId}</p>
        </div>
        <div style={{ maxWidth: "40%", fontSize: "12px" }}>
            <p>Raw data: <code>{JSON.stringify(data)}</code></p>
        </div>
    </div>
})

