/**
 * WHAT IS THIS FILE?
 *
 * SSR entry point, in all cases the application is render outside the browser, this
 * entry point will be the common one.
 *
 * - Server (express, cloudflare...)
 * - npm run start
 * - npm run preview
 * - npm run build
 *
 */
import { renderToStream, RenderToStreamOptions } from '@builder.io/qwik/server';
import { manifest } from '@qwik-client-manifest';
import { getOnMethodsByPath, getRoutes, Methods } from './getOnMethodsByPath';
import Root from './root';


export default function (opts: RenderToStreamOptions) {

    //Note that this only needs to be run in dev mode since it's just type information. 
    //Can skip it as production server to save runtime load
    generateEndpointTypes();
    generateRoutes();
    return renderToStream(<Root />, {
        manifest,
        ...opts,
        prefetchStrategy: {
            implementation: {
                linkInsert: null,
                workerFetchInsert: null,
                prefetchEvent: 'always',
            },
        },
    });
}

async function generateRoutes() { 
    const fs = await import('fs');
    const path = await import('path');

    getRoutes().then(routes => { 
        const filePath = path.join(process.cwd(), "src", "route-types.ts");
        const routeTypes = buildRouteTypesString(routes);
        fs.writeFileSync(filePath, routeTypes)
    })
}

function buildRouteTypesString(routes: string[]) { 
    let string = `//This is an automatically generated file. There is no need to update it manually. Manual updates will be overridden.\nexport interface PathParamsByRoute {\n\t`;
    for (const route of routes) { 
        string += `"${route}":`
        if (!route.includes("[")) { 
            string += `null;\n\t`;
            continue;
        }

        string += `{\n\t\t\t`
        const thisRouteParams: string[] = []
        const slugs = route.split("/");
        for (const slug of slugs) { 
            if (slug && slug.startsWith("[") && slug.endsWith("]")) { 
                thisRouteParams.push(slug)
            }
        }
        for (const param of thisRouteParams) { 
            string += `"${param}":string;\n`
        }
        string += `\t};\n\t`
    }

    string += "\n}"
    return string;
}



async function generateEndpointTypes() {
    const fs = await import('fs');
    const path = await import('path');

    getOnMethodsByPath().then(map => {
        const filePath = path.join(process.cwd(), "src", "endpoint-types.ts");
        const routeTypes = buildEndpointTypesString(map);
        fs.writeFileSync(filePath, routeTypes)
    });
}


function buildEndpointTypesString(map: Awaited<ReturnType<typeof getOnMethodsByPath>>) {
    let string = `//This is an automatically generated file. There is no need to update it manually.
//If you added or removed a route and it's not showing here, restart your dev server 🔁
//(and after you may need to refresh your browser page to trigger the server as well 🔃)
export type Endpoints = `;
    const validMethodsByEndpoint: { [key: string]: Methods[] }[] = [];

    for (const endpoint in map) {
        string += `|"${endpoint}"`
        const onMethods = Object.keys(map[endpoint]) as Methods[];
        const endpointAndMethods: { [key: string]: Methods[] } = {};
        endpointAndMethods[endpoint] = onMethods;
        validMethodsByEndpoint.push(endpointAndMethods);
    }

    string += "\n\n"

    for (let i = 0; i < validMethodsByEndpoint.length; i++) {
        const endpointAndMethods = validMethodsByEndpoint[i];
        for (const endpoint in endpointAndMethods) {
            //only one endpoint but this is the most reasonable data structure otherwise
            //so not really a "loop" but a simple way to get the endpoint as the single key
            const methods = endpointAndMethods[endpoint];
            for (const method of methods) {
                //true loop, could have one or all of the possible methods
                string += `import {${method} as endpoint${i}_${method}} from "./routes${endpoint}"\n`
            }
        }
    }

    string += `\n\nexport interface HandlerTypesByEndpointAndMethod {\n`

    for (let i = 0; i < validMethodsByEndpoint.length; i++) {
        const endpointAndMethods = validMethodsByEndpoint[i];
        for (const endpoint in endpointAndMethods) {
            string += `"${endpoint}":{\n`
            //only one endpoint but this is the most reasonable data structure otherwise
            //so not really a "loop" but a simple way to get the endpoint as the single key
            const methods = endpointAndMethods[endpoint];
            for (const method of methods) {
                //true loop, could have one or all of the possible methods
                string += `\t"${convertOnMethodToFetchMethod(method)}": typeof endpoint${i}_${method};\n`
            }
            string += "};\n"
        }
    }
    string += "}"

    return string;
}

function convertOnMethodToFetchMethod(onMethod: string) {
    return onMethod.slice(2).toLowerCase();
}