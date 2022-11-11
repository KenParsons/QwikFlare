type OnMethodsByPath = {
    [key: string]: {
        [key: string]: Function
    }
}

const validOnMethods = {
    "onGet": true,
    "onPost": true,
    "onPut": true,
    "onPatch": true,
    "onDelete": true,
    "onResponse": true
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
            for (const key in theseExports) {

                if (validOnMethods[(key as keyof typeof validOnMethods)]) {
                    const theFunction = theseExports[key];
                    onMethods[key] = theFunction
                }

            }
        }
        onMethodsByPath[path] = onMethods;
    }
    return onMethodsByPath;
}