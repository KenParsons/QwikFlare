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
import { mapOnMethods } from './mapOnMethods';
import Root from './root';

import { writeFileSync } from 'fs';
import path from "path"

export default function (opts: RenderToStreamOptions) {
    mapOnMethods().then(map => {
        console.log(map);
        console.log(process.cwd());
        const filePath = path.join(process.cwd(), "src", "routeTypes.ts");
        const routesTypes = buildRouteTypesString(map);
        writeFileSync(filePath, routesTypes)
    });

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


function buildRouteTypesString(map: Awaited<ReturnType<typeof mapOnMethods>>) {
    let string = `//This is an automatically generated file. There is no need to update it manually.
//If you added or removed a route and it's not showing here, restart your dev server 🔁
export type Routes = `;
    for (const key in map) {
        string += `|"${key}"`
    };
    return string;
}