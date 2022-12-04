import { z } from "zod";


const paramsValidator = createParamsValidator("/article/[articleId]", {
    articleId: "number",
    description: "string?",
    email: (value) => z.string().parse(value)
});



export const onGet = handler(paramsValidator, (requestEvent) => {

    return {
        message: "You did it!",
        params: requestEvent.params
    }
})

































import { RequestEvent, RequestHandler } from "~/qwik-city/runtime/src";
import { PathParamsByRoute } from "~/route-types";



function handler<
    BODY,
    ParamsValidator extends ((...args: any) => any) | null,
    Params extends Record<string, any> | null = ParamsValidator extends ((...args: any) => any) ? ReturnType<ParamsValidator> : null
>(
    paramsValidator: ParamsValidator,
    requestHandler: RequestHandler<BODY, Params>
) {
    if (!paramsValidator) return requestHandler;

    return (requestEvent: RequestEvent<Params>) => {
        const params = paramsValidator(requestEvent.params);
        requestEvent.params = params;
        return requestHandler(requestEvent)
    }
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
    | ((t: unknown) => any)


export function createParamsValidator<
    Route extends keyof PathParamsByRoute,

    EnforcedTypesByKey extends Record<string, EnforcedType>
    & Record<keyof PathParamsByRoute[Route], EnforcedType>,

    TypeEnforced = { [Property in keyof EnforcedTypesByKey]: ResultOfAction<EnforcedTypesByKey, Property> }
>(route: Route, validations: EnforcedTypesByKey) {


    function getValidatedValuesOrThrow<Values extends Record<string, any>>(values: Values): TypeEnforced {
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

                    if (!validation.endsWith("?")) {
                        throw Error(`Key '${key}' is not '${tag}'. Received -> Type: ${typeof value}  Value: ${value}`)
                    }
                }

            }

            return (values as unknown) as TypeEnforced
        } catch (error) {
            getValidatedValuesOrThrow.catch(error as Error, values, validations);
        }
        return (values as unknown) as TypeEnforced
    }
    getValidatedValuesOrThrow.catch = (error: Error, values: Record<string, any>, validations: EnforcedTypesByKey): any => {
        values; //no-op but don't want linting error
        validations; //no-op but don't want linting error
        throw error;
    }

    return getValidatedValuesOrThrow //TODO: Add optional second param for context to include in the catch
}

//TODO objects and arrays
