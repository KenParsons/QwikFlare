//This is an automatically generated file. There is no need to update it manually.
//If you added or removed a route and it's not showing here, restart your dev server 🔁
//(and after you may need to refresh your browser page to trigger the server as well 🔃)
export type Endpoints = |"/flower"|"/plainPage"|"/sku/[id]"|"/sku/[id]/another-static"|"/sku/[id]/static"|"/api/[...route]"

import {onGet as endpoint0_onGet} from "./routes/flower"
import {onGet as endpoint1_onGet} from "./routes/plainPage"
import {onGet as endpoint2_onGet} from "./routes/sku/[id]"
import {onPost as endpoint2_onPost} from "./routes/sku/[id]"
import {onGet as endpoint3_onGet} from "./routes/sku/[id]/another-static"
import {onPost as endpoint3_onPost} from "./routes/sku/[id]/another-static"
import {onGet as endpoint4_onGet} from "./routes/sku/[id]/static"
import {onPost as endpoint4_onPost} from "./routes/sku/[id]/static"
import {onPost as endpoint5_onPost} from "./routes/api/[...route]"


export type HandlerTypesByEndpointAndMethod = {
"/flower":{
	"get": typeof endpoint0_onGet;
};
"/plainPage":{
	"get": typeof endpoint1_onGet;
};
"/sku/[id]":{
	"get": typeof endpoint2_onGet;
	"post": typeof endpoint2_onPost;
};
"/sku/[id]/another-static":{
	"get": typeof endpoint3_onGet;
	"post": typeof endpoint3_onPost;
};
"/sku/[id]/static":{
	"get": typeof endpoint4_onGet;
	"post": typeof endpoint4_onPost;
};
"/api/[...route]":{
	"post": typeof endpoint5_onPost;
};
}