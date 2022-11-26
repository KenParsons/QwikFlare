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
        const hasAtLeastOneOnMethod = Object.keys(onMethods).length > 0
        if (hasAtLeastOneOnMethod) onMethodsByPath[path] = onMethods;
    }
    return onMethodsByPath;
}

export const getRoutes = async () => {
    const cityPlan = await import("@qwik-city-plan");
    return cityPlan.routes.map(route => route[3] as string);
}