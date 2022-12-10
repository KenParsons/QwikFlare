
/*
    Right now the way I envision it (and have it working locally) is
    the following would go in the user-response.ts file around line ~140:

    const urlObject = new URL(url);
    const searchParams = decodeQueryParams(urlObject.searchParams);
    const routeParams = decodeRouteParams(params);

    const requestEv: RequestEvent<{ [key: string]: any }> = {
        request,
        url: urlObject,
        params: { ...searchParams, ...routeParams },
        response,
        platform,
        next,
        abort,
    };

    This way everything coming in is already decoded by the time the validator touches it

*/



//In this file we can put a comment up top explaining how they can swap out their
//own convertToTypeFromString() and convertToStringFromType() functions if
//they want custom de/serialization
export const convertToTypeFromString = (str: string) => {
    if (str.trim().startsWith("{") || str.trim().startsWith("[")) {
        try {
            return JSON.parse(str)
        } catch {
            return convertToPrimitiveFromString(str);
        }
    } else {
        return convertToPrimitiveFromString(str);
    }

}


export const convertToStringFromType = (value: any) => { 
    return (typeof (value) === "object") ? JSON.stringify(value) : `${value}`;
}

export const decodeRouteParams = (routeParams: Record<string, string>) => {
    const decoded: { [key: string]: any } = {};
    for (const param in routeParams) {
        const value = routeParams[param];
        decoded[param] = convertToTypeFromString(value)
    }
    return decoded
}

export const decodeQueryParams = (queryParams: URLSearchParams) => {
    const decoded: { [key: string]: any } = {}
    queryParams.forEach((value, key) => {
        decoded[key] = convertToTypeFromString(value)
    });
    return decoded;
}


const convertToPrimitiveFromString = (str: string) => {
    if (str === "null") return null;
    if (str === "undefined") return undefined;
    if (str === "true") return true;
    if (str === "false") return false;
    const number = Number(str);
    if (!Number.isNaN(number)) return number
    else return str;
}
