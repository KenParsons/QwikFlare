






































import { RequestHandler } from "~/qwik-city/runtime/src"

function handler(validator: Function, _handler: RequestHandler) {

    return _handler
}






























type ValidationAction =
    | TagType
    | ((value: string) => any)
    | { [x: string]: ValidationAction }
    | Array<ValidationAction>



type ResultOfAction<
    Validations extends Record<string, ValidationAction>,
    Property extends keyof Validations
> = Validations[Property] extends TagType ? ActualTypeByTag[Validations[Property]]
    : Validations[Property] extends Function ? ReturnType<Validations[Property]>
    : Validations[Property] extends ValidationAction ? ValidationAction : never

export function createParamsValidator<
    Route extends keyof PathParamsByRoute,

    Validations extends Record<string, ValidationAction>
    & Record<keyof PathParamsByRoute[Route], ValidationAction>,

    ValidatedValues = { [Property in keyof Validations]: ResultOfAction<Validations, Property> }
>(route: Route, validations: Validations) {
    function getValidatedValuesOrThrow<Values extends Record<string, any>>(values: Values) {
        try {
            for (const key in values) {
                if (validations[key] === undefined) throw Error(`Incoming values included key '${key}' which was not defined in the valdiations`)
            }

            for (const key in validations) {
                if (!values[key]) throw Error(`Incoming values is missing key '${key}'`)
                const value = values[key];
                const validation = validations[key];

                if (typeof validation === "string") {

                    const tag: keyof ActualTypeByTag = validation; handler
                    if (tag === "number") {
                        values[key] = Number(value) as any;
                    }
                    if (tag === "undefined") {
                        values[key] = undefined as any;
                    }
                    if (tag === "boolean") {
                        values[key] = Boolean(value) as any;
                    }

                } else {
                    values[key] = validation(value)
                }
            }

            return (values as unknown) as ValidatedValues
        } catch (error) {
            throw getValidatedValuesOrThrow.catch(values, validations, error as Error);
        }
    }
    getValidatedValuesOrThrow.catch = (values: Record<string, any>, validations: Validations, error: Error): any => {
        throw error;
    }

    return getValidatedValuesOrThrow
}




type ActualTypeByTag = {
    "string": string,
    "number": number,
    "bigint": bigint,
    "boolean": boolean,
    "undefined": undefined,
    "null": null
}

type TagType = keyof ActualTypeByTag

//TODO objects and arrays

const test: ActualTypeByTag = {
    bigint: BigInt(234234234),
    string: "hey",
    boolean: false,
    number: 23523,
    undefined: undefined,
    null: null
}
console.log(test);