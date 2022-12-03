import { PathParamsByRoute } from "~/route-types";


export const paramsValidator = createParamValidator("/article/[articleId]", {
    "[articleId]": "number",
    age: "number",
    title: "string",
    hey: (value) => {
        if (value.length < 10) throw Error(`Too short`);
        return value;
    },
});

const rawParams = {
    age: 234,
    title: "hey",
    hey: "as;sj"
}
console.log(rawParams)

const params = paramsValidator(rawParams);
console.log(params);




export const onGet = async () => {
    return { test: "From post: " + Math.random().toString() }
}



export function createParamValidator<
    Route extends keyof PathParamsByRoute,
    Validations extends Record<string, TagType | ((value: string) => any)> & Record<keyof PathParamsByRoute[Route], TagType | ((value: string) => any)>,
    ValidatedValues = {
        [Property in keyof Validations]:
        Validations[Property] extends TagType ? ActualTypeByTag[Validations[Property]]
        : Validations[Property] extends Function ? ReturnType<Validations[Property]> : never
    }
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
                    if (typeof value !== validation) {
                        throw Error(`Incoming value for ${key} is ${typeof value} but was defined to be ${validation}`)
                    }

                    const tag: keyof ActualTypeByTag = validation;
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