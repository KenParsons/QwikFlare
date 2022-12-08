
/*
    const urlObject = new URL(url);

    const searchParams = decodeQueryParams(urlObject.searchParams);
    const routeParams = decodeRouteParams(params);

    then on the creation of the requestEvent,
    make sure `params` for it is {...searchParams, ...routeParams}
*/




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

const convertToPrimitiveFromString = (str: string) => {
    if (str === "null") return null;
    if (str === "undefined") return undefined;
    if (str === "true") return true;
    if (str === "false") return false;
    const number = Number(str);
    if (!Number.isNaN(number)) return number
    else return str;
}
