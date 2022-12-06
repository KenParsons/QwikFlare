//This is an automatically generated file. There is no need to update it manually.
//If you added or removed a route and it's not showing here, restart your dev server 🔁
//(and after you may need to refresh your browser page to trigger the server as well 🔃)
export type Endpoints = |"/find-user"|"/flower"|"/product/[productId]"|"/profile/[contact]"|"/orgs/[orgName]/[repo]"|"/users/[recordId]/[propertyId]/get"

import {onGet as endpoint0_onGet} from "./routes/find-user"
import {onPost as endpoint0_onPost} from "./routes/find-user"
import {onGet as endpoint1_onGet} from "./routes/flower"
import {onPost as endpoint2_onPost} from "./routes/product/[productId]"
import {onPost as endpoint3_onPost} from "./routes/profile/[contact]"
import {onGet as endpoint4_onGet} from "./routes/orgs/[orgName]/[repo]"
import {onGet as endpoint5_onGet} from "./routes/users/[recordId]/[propertyId]/get"


export interface HandlerTypesByEndpointAndMethod {
"/find-user":{
	"get": typeof endpoint0_onGet;
	"post": typeof endpoint0_onPost;
};
"/flower":{
	"get": typeof endpoint1_onGet;
};
"/product/[productId]":{
	"post": typeof endpoint2_onPost;
};
"/profile/[contact]":{
	"post": typeof endpoint3_onPost;
};
"/orgs/[orgName]/[repo]":{
	"get": typeof endpoint4_onGet;
};
"/users/[recordId]/[propertyId]/get":{
	"get": typeof endpoint5_onGet;
};
}