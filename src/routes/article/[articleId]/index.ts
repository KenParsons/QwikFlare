
import { z } from "zod"

const paramsValidator = createParamsValidator("/article/[articleId]", {
    articleId: "number",
    description: "string",
    userId: "number",
    sampleId: (value) => z.string().or(z.number()).parse(value),
    email: (value) => z.string().email().parse(value),
    shouldBeNull: "null"
})


interface Response {
    message: string,
    params: ReturnType<typeof paramsValidator>
}

// export const onGet: RequestHandler<Response, ReturnType<typeof paramsValidator>> = async (requestEvent) => {
//     console.log(requestEvent.params);
//     const params = paramsValidator(requestEvent.params);
//     return { message: "You did it!", params }
// }






export const onGet = handler<Response>(null, (requestEvent) => {
    return { 
        message: "You did it!",
        params: requestEvent.params
    }
})


import { RequestHandler } from "~/qwik-city/runtime/src";
import { PathParamsByRoute } from "~/route-types";

function handler<BODY = unknown>(validator: Function | null, _handler: RequestHandler<BODY>) {
    if (!validator) return _handler;
    return _handler //temporary for type reasons
}


handler;



type ActualTypeByTag = PrimitiveByTag & PrimitiveOptionalByTag

type PrimitiveByTag = {
    "string": string,
    "number": number,
    "bigint": bigint,
    "boolean": boolean,
    "null": null,
}


type PrimitiveOptionalByTag = {
    "string?": string | undefined,
    "number?": number | undefined,
    "bigint?": bigint | undefined,
    "boolean?": boolean | undefined,
    "null?": null | undefined
}

type TagType = keyof ActualTypeByTag

type ResultOfAction<
    EnforcedTypesByKey extends Record<string, EnforcedType>,
    Property extends keyof EnforcedTypesByKey
> = EnforcedTypesByKey[Property] extends TagType ? ActualTypeByTag[EnforcedTypesByKey[Property]]
    : EnforcedTypesByKey[Property] extends (...args: any) => any ? ReturnType<EnforcedTypesByKey[Property]>
    : never


type EnforcedType =
    | TagType
    | ((t: any) => any)


export function createParamsValidator<
    Route extends keyof PathParamsByRoute,

    EnforcedTypesByKey extends Record<string, EnforcedType>
    & Record<keyof PathParamsByRoute[Route], EnforcedType>,

    TypeEnforced = { [Property in keyof EnforcedTypesByKey]: ResultOfAction<EnforcedTypesByKey, Property> }
>(route: Route, validations: EnforcedTypesByKey) {


    function getValidatedValuesOrThrow<Values extends Record<string, any>>(values: Values) {
        try {

            for (const key in validations) {
                const validation = validations[key];
                const value = values[key];

                if (typeof (validation) === "function") {
                    validation(value);
                    continue;
                }

                if (!validation.endsWith("?") && values[key] === undefined) throw Error(`Incoming key:value pairs are missing key '${key}'`)

                const tag: keyof ActualTypeByTag = validation;
                if (tag === "null" || tag === "null?") {
                    const isNull = value === null;
                    if (!isNull && values[key] !== undefined) throw Error(`Key '${key}' is not '${tag}'. Received: ${value}`)
                } else if (typeof value !== tag) {
                    throw Error(`Key '${key}' is not '${tag}'. Received: ${value}`)
                }

            }

            return (values as unknown) as TypeEnforced
        } catch (error) {
            throw getValidatedValuesOrThrow.catch(error as Error, values, validations);
        }
    }
    getValidatedValuesOrThrow.catch = (error: Error, values: Record<string, any>, validations: EnforcedTypesByKey): any => {
        values; //no-op but don't want linting error
        validations; //no-op but don't want linting error
        throw error;
    }

    return getValidatedValuesOrThrow
}

//TODO objects and arrays
