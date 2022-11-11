//This is an automatically generated file. There is no need to update it manually.
//If you added or removed a route and it's not showing here, restart your dev server 🔁
export type Endpoints = | "/flower" | "/plainPage" | "/sku/[...id]"

import { onGet as _flower_onGet } from "./routes/flower"
import { onGet as _sku_$id_onGet } from "./routes/sku/[...id]"
import { onGet as _plainPage_onGet } from "./routes/plainPage"

export type HandlerTypesByEndpointAndMethod = {
    "/flower.onGet": typeof _flower_onGet;
    "/sku/[...id].onGet": typeof _sku_$id_onGet;
    "/plainPage.onGet": typeof _plainPage_onGet;
}
