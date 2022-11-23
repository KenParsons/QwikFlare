
import { $, component$, Resource, useSignal, useWatch$ } from "@builder.io/qwik"
import { RequestHandler, useEndpoint, useLocation } from '~/qwik-city/runtime/src';
import { useBackend } from "~/qwik-city/runtime/src/library/use-endpoint";

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

export interface UserSearchInputs { username?: string, id?: string }

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

export const onPost: RequestHandler<PublicProfile, { newName: string }> = async (requestEvent) => {
    const { newName } = requestEvent.inputs;
    requestEvent.inputs;

    const userProfile = await getUserProfile("hi", "bye");
    return {
        firstName: userProfile?.firstName || "No user found",
        likes: userProfile?.likes || [],
        dislikes: userProfile?.dislikes || [],
        lastRetrieved: (new Date()).toLocaleTimeString(),
        requestId: Math.random() * 1000
    }
}

export const afterCall = (endpoint: any,) => {

}


type Test<A> = A extends true ? true : false

const blah: Test<true | undefined> = true

export default component$(() => {
    const location = useLocation();
    console.log('location query', location.query)

    const accountInfoEndpoint = useEndpoint("/find-user", { method: "get", skipInitialCall: true });
    const accountInfoEndpoint2 = useEndpoint("/find-user", { method: "get", inputs: { username: "hi", id: "hi" } });

    accountInfoEndpoint.call()
    // const accountInfoEndpoint3 = useEndpoint("/find-user", { method: "get" });

    //Need to figure out TS issue again 
    const updateAccountEndpoint = useEndpoint("/find-user", { method: "post", skipInitialCall: true });

    const userSearchInput = useSignal("");
    useWatch$(async ({ track }) => {
        track(() => updateAccountEndpoint.resource.promise);
        console.log('update resource changed')
        await updateAccountEndpoint.resource.promise
        accountInfoEndpoint.call({ inputs: { id: userSearchInput.value, username: userSearchInput.value } });
    })

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
                accountInfoEndpoint.call({ inputs: { id: userSearchInput.value, username: userSearchInput.value } })
                accountInfoEndpoint.globalCall();
            }}>
                Find user
            </button>

            {accountInfoEndpoint.hasBeenCalled ?
                <>
                    <Resource
                        value={accountInfoEndpoint.resource}
                        onResolved={(data) => {
                            return <>
                                <PublicProfileDisplay data={data} />
                                {data.firstName === "No user found" ? <></>
                                    :
                                    <UpdateNameButton endpoint={updateAccountEndpoint} name={"Hey"} />
                                }
                            </>
                        }}
                    />
                    <Resource value={accountInfoEndpoint2.resource} onResolved={(data) => {
                        return <>
                            Here's the data on a separate one {data.lastRetrieved} + {data.requestId}
                        </>
                    }} />
                </>
                : <p>Please search for a user</p>
            }
        </div>
    </div >
});

export const UpdateNameButton = component$((props: { endpoint: ReturnType<typeof useEndpoint>, name: string }) => {
    return <button onClick$={() => props.endpoint.call({ inputs: { newName: props.name } })}>
        Update name
    </button>
})

export const PublicProfileDisplay = component$(({ data }: { data: PublicProfile }) => {

    return <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <div>
            <h1>Name: {data.firstName}</h1>
            {data.likes.length > 0 && <>
                <h3>Likes:</h3>
                <div>
                    {data.likes.map(like => <p>{like}</p>)}
                </div>
            </>
            }
            <h3>Dislikes:</h3><div> {data.dislikes.map(dislike => <p>{dislike}</p>)}</div>
            <hr />
            <p>Last retrieved at {data.lastRetrieved}</p>
            <p style={{ fontSize: "10px" }}>Request ID: {data.requestId}</p>
        </div>
        <div style={{ maxWidth: "40%", fontSize: "12px" }}>
            <p>Raw data: <code>{JSON.stringify(data)}</code></p>
        </div>
    </div>
})

