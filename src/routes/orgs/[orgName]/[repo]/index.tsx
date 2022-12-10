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

paramsValidator.route

export const onGet = handler(paramsValidator, (requestEvent) => {
    requestEvent.params.
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



type EndsWithQM<T> = T extends `${string}?` ? true : false
type RemoveEndingQM<T> = T extends `${infer AllButLast}?` ? AllButLast : T




import { RequestEvent } from "~/qwik-city/runtime/src";
import { useEndpoint } from "~/qwik/packages/qwik-city/lib";
import { component$, Resource } from "~/qwik/packages/qwik/dist/core";
import { PathParamsByRoute } from "~/typed-routing/route-types";


export function handler<
    BODY,
    ParamsValidator extends ((value: any) => any) | null,
    Params extends Record<string, any> | null = ParamsValidator extends ((value: any) => any) ? ReturnType<ParamsValidator> : null,
>(
    paramsValidator: ParamsValidator,
    requestHandler: (requestEvent: RequestEvent<Params>) => BODY
) {
    //TODO: DEV/BUILD-TIME ONLY! runtime check that filename/route name is correct with what the paramsValidator was given
    //paramsValidator.route will have that info to check against. throw descriptive error if mismatch
    
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

    _TypeEnforcedParams = ValidatorFunctionOrValidatorByKey extends ValidatorFunction ? ReturnType<ValidatorFunctionOrValidatorByKey>
    : ValidatorFunctionOrValidatorByKey extends Record<string, Validator> ?
    { [Property in keyof ValidatorFunctionOrValidatorByKey]: ResultOfValidation<ValidatorFunctionOrValidatorByKey, Property> }
    : never

>(route: Route, validations: ValidatorFunctionOrValidatorByKey) {

    type __TypeEnforcedParams = { [P in keyof _TypeEnforcedParams as RemoveEndingQM<P>]: EndsWithQM<P> extends true ? _TypeEnforcedParams[P] | undefined : _TypeEnforcedParams[P] }
    //NEED TO DO ACTUAL RUNTIME USE OF THIS STILL^^^

    type UndefinedProperties<T> = {
        [P in keyof T]-?: undefined extends T[P] ? P : never
    }[keyof T]

    type UndefinedUnionsAsOptional<T> = Partial<Pick<T, UndefinedProperties<T>>> & Pick<T, Exclude<keyof T, UndefinedProperties<T>>>

    type TypeEnforcedParams = UndefinedUnionsAsOptional<__TypeEnforcedParams>
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
                const isRequired = (!typeTag.endsWith("?") && !key.endsWith("?"));
                const isOptional = !isRequired;

                if (key.endsWith("?"))

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


