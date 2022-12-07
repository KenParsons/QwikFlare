const paramsValidator = createParamsValidator("/orgs/[orgName]/[repo]", {
    orgName: "string",
    repo: "string",
    "test?": "string"
});

export const onGet = handler(paramsValidator, (requestEvent) => {
    requestEvent
    return {
        message: "You did it!",
        params: requestEvent.params
    }
})


export default component$(() => {
    const endpoint = useEndpoint<typeof onGet>();

    return <Resource value={endpoint} onResolved={(data) => {
        return <div>
            {data.message}
            <br />
            {JSON.stringify(data.params)}
        </div>
    }} />
})


type RemoveString<
    T extends string,
    RemoveThis extends string
> = T extends `${infer Before}${RemoveThis}${infer After}`
    ? RemoveString<`${Before}${After}`, RemoveThis>
    : T




type EndsWithQM<T> = T extends `${string}?` ? true : false
type RemoveEndingQM<T extends string> = T extends `${infer AllButLast}?` ? AllButLast : T


const test: EndsWithQM<"hi"> = false

console.log(test);
const test2: RemoveEndingQM<"hi?"> = "hi"

console.log(test2);

const testObj = {
    orgName: "string",
    repo: "string",
    "test?": "string"
};

type Keys = RemoveEndingQM<keyof typeof testObj>

type ObjType = {
    [Property in keyof typeof testObj]: typeof testObj[Property]
}




import { z } from "zod";
import { RequestEvent } from "~/qwik-city/runtime/src";
import { useEndpoint } from "~/qwik/packages/qwik-city/lib";
import { component$, Resource } from "~/qwik/packages/qwik/dist/core";
import { PathParamsByRoute } from "~/routing-config/route-types";
import { String } from "ts-toolbelt"


export function handler<
    BODY,
    ParamsValidator extends ((value: any) => any) | null,
    Params extends Record<string, any> | null = ParamsValidator extends ((value: any) => any) ? ReturnType<ParamsValidator> : null,
>(
    paramsValidator: ParamsValidator,
    requestHandler: (requestEvent: RequestEvent<Params>) => BODY
) {
    //TODO: DEV/BUILD-TIME ONLY! runtime check that filename/route name is correct with what the paramsValidator was given
    //maybe give paramsvalidator a secret hidden key with that info on it so we can check here at build time
    return (requestEvent: RequestEvent<Params>) => {
        if (paramsValidator) {
            const params = paramsValidator(requestEvent.params);
            requestEvent.params = params;
        }
        return requestHandler(requestEvent)
    }
}




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
type Primitive = keyof PrimitiveByTag

type LiteralFromString<T extends string> = T extends `${infer X}` ? X : never;
type MultiPrimitive<
    T extends Primitive | `${string}|${Primitive}`
> = T extends `${infer X}`
    ? String.Split<X, "|">[number] extends Primitive
    ? String.Split<X, "|">[number]
    : "One of your primitives is a typo"
    : "One of your primitives is a typo"

type Ensure<T extends Primitive> = T

type test = Ensure<MultiPrimitive<"string">>




type ActualTypeByTag = PrimitiveByTag & PrimitiveOptionalByTag

type TypeTag = keyof ActualTypeByTag

type ValidatorFunction = ((value: any) => any)

type Validator =
    | TypeTag
    | ValidatorFunction

type PathParamValidator =
    | keyof PrimitiveByTag
    | ValidatorFunction

type ResultOfValidation<
    ValidatorByKey extends Record<string, Validator>,
    Property extends keyof ValidatorByKey
> = ValidatorByKey[Property] extends TypeTag ? ActualTypeByTag[ValidatorByKey[Property]]
    : ValidatorByKey[Property] extends ValidatorFunction ? ReturnType<ValidatorByKey[Property]>
    : never


export function createParamsValidator<
    Route extends keyof PathParamsByRoute,

    ValidatorFunctionOrValidatorByKey extends
    ((value: any) => Record<string, any> & Record<keyof PathParamsByRoute[Route], any>)
    |
    Record<string, Validator> & Record<keyof PathParamsByRoute[Route], PathParamValidator>,

    TypeEnforcedParams = ValidatorFunctionOrValidatorByKey extends ValidatorFunction ? ReturnType<ValidatorFunctionOrValidatorByKey>
    : ValidatorFunctionOrValidatorByKey extends Record<string, Validator> ?
    { [Property in keyof ValidatorFunctionOrValidatorByKey]: ResultOfValidation<ValidatorFunctionOrValidatorByKey, Property> }
    : never

>(route: Route, validations: ValidatorFunctionOrValidatorByKey) {


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
                const isRequired = (typeTag.endsWith("?") === false);
                const isOptional = !isRequired;

                if (isRequired && values[key] === undefined) {
                    throw Error(`Incoming key:value pairs are missing key '${key}'`)
                }

                if (typeTag === "null" || typeTag === "null?") { // the infamous typeof bug rears its head. have to check this manually
                    const isNull = value === null;
                    if (!isNull && values[key] !== undefined) throw Error(`Key '${key}' is not '${typeTag}'. Received: ${value}`)

                } else if (typeof value !== typeTag) {
                    if (isOptional && value === undefined) {
                        continue
                    }
                    throw Error(`Key '${key}' is not '${typeTag}'. Received -> Type: ${typeof value}  Value: ${value}`)
                }

            }

            return (values as unknown) as TypeEnforcedParams
        } catch (error) {
            getValidatedValuesOrThrow.catch(error as Error, values, validations, context);
        }
        return (values as unknown) as TypeEnforcedParams
    }

    getValidatedValuesOrThrow.catch = (error: Error, values: Record<string, any>, validations?: ValidatorFunctionOrValidatorByKey, context?: any): any => {
        context; //no-op but don't want linting error
        values; //no-op but don't want linting error
        validations; //no-op but don't want linting error
        throw error;
    }

    getValidatedValuesOrThrow.route = route;

    return getValidatedValuesOrThrow
}

