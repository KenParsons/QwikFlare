import { z } from "zod";

const paramsValidator = createParamsValidator("/article/[articleId]/[repo]", (params) => {
    const validatedParams = z.object({
        articleId: z.number(),
        repo: z.literal("Qwik").or(z.literal("Astro")).or(z.literal("Solid"))
    }).parse(params);

    return validatedParams
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

type ActualTypeByTag = PrimitiveByTag & PrimitiveOptionalByTag

type TypeTag = keyof ActualTypeByTag

type Validator =
    | TypeTag
    | ((value: unknown) => any)


type ResultOfValidation<
    ValidatorByKey extends Record<string, Validator>,
    Property extends keyof ValidatorByKey
> = ValidatorByKey[Property] extends TypeTag ? ActualTypeByTag[ValidatorByKey[Property]]
    : ValidatorByKey[Property] extends (value: unknown) => any ? ReturnType<ValidatorByKey[Property]>
    : never


export function createParamsValidator<
    Route extends keyof PathParamsByRoute,

    EnforcedTypesByKeyOrFunctionThatReturnsThem extends
    Record<string, Validator> & Record<keyof PathParamsByRoute[Route], Validator>
    |
    ((value: any) => Record<string, any> & Record<keyof PathParamsByRoute[Route], any>),

    TypeEnforcedParams = EnforcedTypesByKeyOrFunctionThatReturnsThem extends ((value: any) => any) ? ReturnType<EnforcedTypesByKeyOrFunctionThatReturnsThem>
    : EnforcedTypesByKeyOrFunctionThatReturnsThem extends Record<string, Validator> ?
    { [Property in keyof EnforcedTypesByKeyOrFunctionThatReturnsThem]: ResultOfValidation<EnforcedTypesByKeyOrFunctionThatReturnsThem, Property> }
    : never
>(route: Route, validations: EnforcedTypesByKeyOrFunctionThatReturnsThem) {


    function getValidatedValuesOrThrow<Values extends Record<string, any>>(values: Values, context?: any): TypeEnforcedParams {
        if (typeof validations === "function") {
            try {
                //We have to use the runtime validation using typeof, limited to the general "function"
                //but the type system sees that as too loose despite the other constraints
                //@ts-ignore
                return validations(values)
            } catch (error) {
                getValidatedValuesOrThrow.catch(error as Error, values, validations, context)

                //because we don't throw or return anything in .catch() beacuse it's open to be extended by the developer,
                //we need to "return" this here for the sake of the types still passing through properly
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
            getValidatedValuesOrThrow.catch(error as Error, values, validations, context);
        }
        return (values as unknown) as TypeEnforcedParams
    }

    getValidatedValuesOrThrow.catch = (error: Error, values: Record<string, any>, validations?: EnforcedTypesByKeyOrFunctionThatReturnsThem, context?: any): any => {
        values; //no-op but don't want linting error
        validations; //no-op but don't want linting error
        throw error;
    }

    return getValidatedValuesOrThrow //TODO: Add optional second param for context to include in the catch
}

