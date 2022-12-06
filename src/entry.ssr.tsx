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
import { generateEndpointTypes, generateRoutes } from './route-file-generation/types-generation';
import Root from './root';


export default function (opts: RenderToStreamOptions) {
    //Note that this only needs to be run in dev mode since it's just type information. 
    //Can skip it as production server to save runtime load
    //Probably needs to go elsewhere anyway
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
