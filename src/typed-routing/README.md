This is the folder that would be placed in the dev's project. The encoding-decoding is where they can customize how they want to parse/serialize. 

the .d.ts files are the continually auto-generated type files. 

`helpers.ts` is there right now out of convenience and familiarity for me, but I believe we could keep those in the qwik city lib itself, which would be preferred


Also wanted to point out something real quick using an example of createParamsValidator
```ts
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
```