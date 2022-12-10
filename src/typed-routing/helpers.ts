//I think these helpers can actually be put inside the lib instead of in this config folder? 
// As long as the imports use project-level syntax, e.g.,
// instead of import { PathParamsByRoute } from "./route-types";  it would be:
// import { PathParamsByRoute } from "~/typed-routing/route-types";
// Would love input on that, thanks!

import { convertToStringFromType, decodePathParams, decodeQueryParams } from "./endcoding-decoding";
import { HandlerTypesByRouteAndMethod } from "./endpoint-types";
import { RequestEvent } from "~/qwik-city/runtime/src";
import { PathParamsByRoute } from "./route-types";
import { RequestHandler } from "~/qwik/packages/qwik-city/lib";

export type TypedParamsOf<T> = T extends RequestHandler<infer U, infer X> ? X : undefined;


export function route<Route extends keyof PathParamsByRoute>
    (
        ...args: PathParamsByRoute[Route] extends null ?
            DoOnGetInputsExist<Route> extends true ? [route: Route, params: OnGetInputsIfTheyExist<Route>] :
            [route: Route]
            : [route: Route, params: PathParamsByRoute[Route] & OnGetInputsIfTheyExist<Route>]
    ) {

    const [route, params] = args;
    let path = route as string;
    const pathParams: Record<string, boolean> = {};
    for (const slug of path.split("/")) {
        if (slug.startsWith('[') && slug.endsWith(']')) {
            const startIndex = slug.startsWith("[...") ? 4 : 1;
            pathParams[slug.slice(startIndex, -1)] = true;
        }
    }

    let queryParams = "";
    if (params) {
        for (const param in params) {
            const passedString: string = (params as any)[param]
            if (pathParams[param]) {
                path = path.replace(`/[${param}]`, `/${passedString}`);
                path = path.replace(`/[...${param}]`, `/${passedString}`);

            } else {
                const value = (params as any)[param];
                const stringified = convertToStringFromType(value);
                queryParams += `${param}=${stringified}&`
            }
        }


    }

    if (queryParams) {
        path = path + "?" + queryParams.slice(0, -1) //trailing &
    }
    return path;
}


type DoOnGetInputsExist<Route> = Route extends keyof HandlerTypesByRouteAndMethod ? "get" extends keyof HandlerTypesByRouteAndMethod[Route] ?
    TypedParamsOf<HandlerTypesByRouteAndMethod[Route]["get"]> extends undefined ?
    false : true : false : false

type OnGetInputsIfTheyExist<Route extends keyof PathParamsByRoute> = Route extends keyof HandlerTypesByRouteAndMethod ? "get" extends keyof HandlerTypesByRouteAndMethod[Route] ?
    TypedParamsOf<HandlerTypesByRouteAndMethod[Route]["get"]> extends undefined ?
    {} : TypedParamsOf<HandlerTypesByRouteAndMethod[Route]["get"]> : {} : {}



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
            //NOTE This is an alternative way where decoding only happens when calling the validator (still before actual validation!)
            //But this may be desired if we don't want auto-decoding happening for someone who's not even using any of this system:
            const queryParams = decodeQueryParams(requestEvent.url.searchParams);
            const pathParams = decodePathParams(requestEvent.params!);

            const params = paramsValidator({...pathParams, ...queryParams});


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



type EndsWithQM<T> = T extends `${string}?` ? true : false
type RemoveEndingQM<T> = T extends `${infer AllButLast}?` ? AllButLast : T

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

    type UndefinedProperties<T> = {
        [P in keyof T]-?: undefined extends T[P] ? P : never
    }[keyof T]

    type UndefinedAsOptional<T> = Partial<Pick<T, UndefinedProperties<T>>> & Pick<T, Exclude<keyof T, UndefinedProperties<T>>>

    type TypeEnforcedParams = UndefinedAsOptional<__TypeEnforcedParams>
    function getValidatedValuesOrThrow<Values extends Record<string, any>>(values: Values, context?: any): TypeEnforcedParams {
        console.log({validations, values})
        if (typeof validations === "function") {
            try {
                //We have to use the runtime validation using typeof, limited to the general "function"
                //but the type system sees that as too loose despite the other constraints
                //@ts-ignore
                return validations(values)
            } catch (error) {
                getValidatedValuesOrThrow.catch(error as Error, values, validations, context)

                //because we don't throw or return anything in .catch() beacuse it's open to be extended by the developer,
                //we need to return this here for the sake of the types still passing through properly
                return (values as unknown) as TypeEnforcedParams
            }
        }

        try {

            for (const key in validations) {
                const value = key.endsWith("?") ? values[key.slice(0,-1)] : values[key];

                const validation = validations[key];
                if (typeof (validation) === "function") {
                    validation(value);
                    continue;
                }

                //In the function case, we've already continued above, but TypeScript won't recognize that
                //That's why I think we have to typecast here
                const typeTag = validation as keyof ActualTypeByTag;
                const isRequired = (!typeTag.endsWith("?") && !key.endsWith("?"));
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


