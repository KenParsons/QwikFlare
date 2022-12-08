import { getOnMethodsByPath, getRoutes, Methods } from './city-plan-extraction';
export const routesConfigDirectoryName = "typed-routing";


export async function generateRoutes() {
    const fs = await import('fs');
    const path = await import('path');

    getRoutes().then(routes => {
        const filePath = path.join(process.cwd(), "src", routesConfigDirectoryName, "route-types.d.ts");
        const routeTypes = buildRouteTypesString(routes);
        fs.writeFileSync(filePath, routeTypes)
    })
}

function buildRouteTypesString(routes: string[]) {
    let string = `//This is an automatically generated file. There is no need to update it manually. Manual updates will be overridden.\nexport interface PathParamsByRoute {`;
    for (const route of routes) {
        string += `"${route}":`
        if (!route.includes("[")) {
            string += `null;`;
            continue;
        }

        string += `{`
        const thisRouteParams: string[] = []
        const slugs = route.split("/");
        for (const slug of slugs) {
            if (slug && slug.startsWith("[") && slug.endsWith("]")) {
                thisRouteParams.push(slug.slice(1, -1))
            }
        }
        for (const param of thisRouteParams) {
            string += `"${param}":unknown;`
        }
        string += `};`
    }

    string += "}"
    return string;
}

export async function generateEndpointTypes() {
    const fs = await import('fs');
    const path = await import('path');

    getOnMethodsByPath().then(onMethodsByPath => {
        const filePath = path.join(process.cwd(), "src", routesConfigDirectoryName, "endpoint-types.d.ts");
        const routeTypes = buildEndpointTypesString(onMethodsByPath);
        fs.writeFileSync(filePath, routeTypes)
    });
}

function buildEndpointTypesString(onMethodsByPath: Awaited<ReturnType<typeof getOnMethodsByPath>>) {
    let string = `//This is an automatically generated file. There is no need to update it manually. Manual updates will be overridden.
export type Endpoints = `;
    const validMethodsByEndpoint: { [key: string]: Methods[] }[] = [];

    for (const path in onMethodsByPath) {
        string += `|"${path}"`
        const onMethods = Object.keys(onMethodsByPath[path]) as Methods[];
        const endpointAndMethods: { [key: string]: Methods[] } = {};
        endpointAndMethods[path] = onMethods;
        validMethodsByEndpoint.push(endpointAndMethods);
    }

    string += "\n"

    for (let i = 0; i < validMethodsByEndpoint.length; i++) {
        const endpointAndMethods = validMethodsByEndpoint[i];
        for (const endpoint in endpointAndMethods) {
            //only one endpoint but this is the most reasonable data structure otherwise
            //so not really a "loop" but a simple way to get the endpoint as the single key
            const methods = endpointAndMethods[endpoint];
            for (const method of methods) {
                //true loop, could have one or all of the possible methods
                string += `import {${method} as endpoint${i}_${method}} from "~/routes${endpoint}"\n`
            }
        }
    }

    string += `export interface HandlerTypesByRouteAndMethod {`

    for (let i = 0; i < validMethodsByEndpoint.length; i++) {
        const endpointAndMethods = validMethodsByEndpoint[i];
        for (const endpoint in endpointAndMethods) {
            string += `"${endpoint}":{`
            //only one endpoint but this is the most reasonable data structure otherwise
            //so not really a "loop" but a simple way to get the endpoint as the single key
            const methods = endpointAndMethods[endpoint];
            for (const method of methods) {
                //true loop, could have one or all of the possible methods
                string += `"${convertOnMethodToFetchMethod(method)}": typeof endpoint${i}_${method};`
            }
            string += "};"
        }
    }
    string += "}"

    return string;
}

function convertOnMethodToFetchMethod(onMethod: string) {
    return onMethod.slice(2).toLowerCase();
}