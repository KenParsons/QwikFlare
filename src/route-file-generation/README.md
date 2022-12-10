I'm not sure the exact best place for this to go. My instinct is this logic should all go in the same place where the city plan is built in the first place. Then wouldn't need to import it and scan over it at all to begin with. 

Right now though I'm using it as is and have it in the `entry.ssr.tsx` file like so:
```js
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
    
```

Need help with that, thanks!

