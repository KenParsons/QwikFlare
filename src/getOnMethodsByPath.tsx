type OnMethodsByPath = {
    [key: string]: {
        [Property in Methods]?: Function
    }
}

export type Methods = "onGet" | "onPost" | "onPut" | "onPatch" | "onDelete" | "onRequest"

const validOnMethods: { [Property in Methods]: boolean } = {
    "onGet": true,
    "onPost": true,
    "onPut": true,
    "onPatch": true,
    "onDelete": true,
    "onRequest": true
}

export const getOnMethodsByPath = async () => {
    console.log("Mapping onMethods by path")
    const onMethodsByPath: OnMethodsByPath = {};
    const cityPlan = await import("@qwik-city-plan");
    for (const routeData of cityPlan.routes) {
        const [regex, exportsGetters, routeParams, path, qrls] = routeData;

        const onMethods: { [key: string]: Function } = {}
        for (const getter of exportsGetters) {
            const theseExports = getter();
            for (const exportName in theseExports) {

                if (validOnMethods[(exportName as keyof typeof validOnMethods)]) {
                    const theFunction = theseExports[exportName];
                    onMethods[exportName] = theFunction
                }

            }
        }
        if (Object.keys(onMethods).length > 0) onMethodsByPath[path] = onMethods;
    }
    return onMethodsByPath;
}