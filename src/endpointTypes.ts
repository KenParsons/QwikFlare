//This is an automatically generated file. There is no need to update it manually.
//If you added or removed a route and it's not showing here, restart your dev server 🔁
//(and after you may need to refresh your browser page to trigger the server as well 🔃)
export type Endpoints = |"/find-user"|"/flower"|"/plainPage"|"/api/[...route]"

import {onGet as endpoint0_onGet} from "./routes/find-user"
import {onGet as endpoint1_onGet} from "./routes/flower"
import {onGet as endpoint2_onGet} from "./routes/plainPage"
import {onPost as endpoint3_onPost} from "./routes/api/[...route]"


export type HandlerTypesByEndpointAndMethod = {
"/find-user":{
	"get": typeof endpoint0_onGet;
};
"/flower":{
	"get": typeof endpoint1_onGet;
};
"/plainPage":{
	"get": typeof endpoint2_onGet;
};
"/api/[...route]":{
	"post": typeof endpoint3_onPost;
};
}