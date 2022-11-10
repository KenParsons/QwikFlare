type OnMethodsByPath = {
    [key: string]: {
        [key: string]: boolean
    }
}

export const mapOnMethods = async () => {
    console.log("Mapping onMethods by path")
    const onMethodsByPath: OnMethodsByPath = {};
    const cityPlan = await import("@qwik-city-plan");
    for (const routeData of cityPlan.routes) {
        const [regex, exportsGetters, routeParams, path, qrls] = routeData;

        const onMethods: { [key: string]: boolean } = {}
        for (const getter of exportsGetters) {
            const theseExports = getter();
            for (const key in theseExports) {
                if (key.startsWith("on")) {
                    onMethods[key] = true;
                }
            }
        }
        onMethodsByPath[path] = onMethods;
    }
    return onMethodsByPath;
}