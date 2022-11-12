//This is an automatically generated file. There is no need to update it manually.
//If you added or removed a route and it's not showing here, restart your dev server 🔁
//(and after you may need to refresh your browser page to trigger the server as well 🔃)
export type Endpoints = |"/flower"|"/plainPage"|"/api/[...route]"|"/sku/[...id]"

import {onGet as endpoint0_onGet} from "./routes/flower"
import {onGet as endpoint1_onGet} from "./routes/plainPage"
import {onPost as endpoint2_onPost} from "./routes/api/[...route]"
import {onGet as endpoint3_onGet} from "./routes/sku/[...id]"
import {onPost as endpoint3_onPost} from "./routes/sku/[...id]"


export type HandlerTypesByEndpointAndMethod = {
"/flower":{
	"get": typeof endpoint0_onGet;
};
"/plainPage":{
	"get": typeof endpoint1_onGet;
};
"/api/[...route]":{
	"post": typeof endpoint2_onPost;
};
"/sku/[...id]":{
	"get": typeof endpoint3_onGet;
	"post": typeof endpoint3_onPost;
};
}