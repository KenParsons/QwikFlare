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
import { getOnMethodsByPath } from './getOnMethodsByPath';
import Root from './root';


export default function (opts: RenderToStreamOptions) {

    //Note that this only needs to be run in dev mode since it's just type information. 
    //Can skip it as production server to save runtime load
    generateEndpointTypes();

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

async function generateEndpointTypes() {
    const fs = await import('fs');
    const path = await import('path');

    getOnMethodsByPath().then(map => {
        console.log(map);
        const filePath = path.join(process.cwd(), "src", "endpointTypes.ts");
        const routeTypes = buildRouteTypesString(map);
        fs.writeFileSync(filePath, routeTypes)
    });
}


function buildRouteTypesString(map: Awaited<ReturnType<typeof getOnMethodsByPath>>) {
    let string = `//This is an automatically generated file. There is no need to update it manually.
//If you added or removed a route and it's not showing here, restart your dev server 🔁
export type Endpoints = `;
    for (const route in map) {
        const onMethods = map[route];
        let shouldInclude = false;
        for (const onMethod in onMethods) {
            if (onMethod === "onGet" || onMethod === "onRequest") {
                shouldInclude = true;
            }
        }
        if (shouldInclude) { string += `|"${route}"` }
    };
    return string;
}