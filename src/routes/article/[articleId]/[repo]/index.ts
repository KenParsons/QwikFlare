import { z } from "zod";
z


const paramsValidator = createParamsValidator("/article/[articleId]/[repo]", (params) => {
    const validatedParams = z.object({
        articleId: z.number(),
        repo: z.literal("Qwik").or(z.literal("Astro")).or(z.literal("Solid"))
    }).parse(params);

    return validatedParams
});


export const onGet = handler(paramsValidator, (requestEvent) => {
    requestEvent.params

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

    EnforcedTypesByKeyOrValidatorFunction extends Record<string, EnforcedType>
    & Record<keyof PathParamsByRoute[Route], EnforcedType> | ((...args: any) => Record<string, any> & Record<keyof PathParamsByRoute[Route], any>),

    TypeEnforcedParams = EnforcedTypesByKeyOrValidatorFunction extends ((...args: any) => any) ? ReturnType<EnforcedTypesByKeyOrValidatorFunction>
    : EnforcedTypesByKeyOrValidatorFunction extends Record<string, EnforcedType> ?
    { [Property in keyof EnforcedTypesByKeyOrValidatorFunction]: ResultOfAction<EnforcedTypesByKeyOrValidatorFunction, Property> }
    : never
>(route: Route, validations: EnforcedTypesByKeyOrValidatorFunction) {


    function getValidatedValuesOrThrow<Values extends Record<string, any>>(values: Values): TypeEnforcedParams {
        if (typeof validations === "function") {
            try {
                //We have to use the runtime type validation of the general "function"
                //but the type system sees that as too loose despite the other constraints
                //@ts-ignore
                return validations(values)
            } catch (error) {
                getValidatedValuesOrThrow.catch(error as Error, values)
                return (values as unknown) as TypeEnforcedParams
            }
        }

        try {

            for (const key in validations) {
                const validation = validations[key];
                const value = values[key];

                if (typeof (validation) === "function") {
                    validation(value);
                    continue;
                }

                //In the function case, we've already continued above, but TypeScript won't recognize that
                //That's why I think we have to typecast here
                const typeTag = validation as keyof ActualTypeByTag;
                if (!typeTag.endsWith("?") && values[key] === undefined) {
                    throw Error(`Incoming key:value pairs are missing key '${key}'`)
                }

                if (typeTag === "null" || typeTag === "null?") {
                    const isNull = value === null;
                    if (!isNull && values[key] !== undefined) throw Error(`Key '${key}' is not '${typeTag}'. Received: ${value}`)
                } else if (typeof value !== typeTag) {

                    if (!typeTag.endsWith("?")) {
                        throw Error(`Key '${key}' is not '${typeTag}'. Received -> Type: ${typeof value}  Value: ${value}`)
                    }
                }

            }

            return (values as unknown) as TypeEnforcedParams
        } catch (error) {
            getValidatedValuesOrThrow.catch(error as Error, values, validations);
        }
        return (values as unknown) as TypeEnforcedParams
    }
    getValidatedValuesOrThrow.catch = (error: Error, values: Record<string, any>, validations?: EnforcedTypesByKeyOrValidatorFunction): any => {
        values; //no-op but don't want linting error
        validations; //no-op but don't want linting error
        throw error;
    }

    return getValidatedValuesOrThrow //TODO: Add optional second param for context to include in the catch
}

