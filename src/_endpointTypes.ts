//EXAMPLE/PLAYGROUND FILE


export type Endpoints = | "/flower" | "/plainPage" | "/api/[...route]" | "/sku/[...id]"

import { onGet as endpoint0_onGet } from "./routes/flower"
import { onGet as endpoint1_onGet } from "./routes/plainPage"
import { onRequest as endpoint2_onRequest } from "./routes/api/[...route]"
import { onGet as endpoint3_onGet } from "./routes/sku/[...id]"


export type HandlerTypesByEndpointAndMethod = {
    "/flower.get": typeof endpoint0_onGet;
    "/plainPage.get": typeof endpoint1_onGet;
    "/api/[...route].request": typeof endpoint2_onRequest;
    "/sku/[...id].get": typeof endpoint3_onGet;
}

export type ValidEndpointMethods = {
    "/flower": | "get"
    "/plainPage": | "get"
    "/api/[...route]": | "request"
    "/sku/[...id]": | "get"
}


export type _HandlerTypesByEndpointAndMethod = {
    "/flower": {
        "get": typeof endpoint0_onGet
    }
    "/plainPage": {
        "get": typeof endpoint1_onGet
    }
    "/api/[...route]": {
        "request": typeof endpoint2_onRequest;
    }
    "/sku/[...id]": {
        "get": typeof endpoint3_onGet;
    }
}