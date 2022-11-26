//This is an automatically generated file. There is no need to update it manually.
//If you added or removed a route and it's not showing here, restart your dev server 🔁
//(and after you may need to refresh your browser page to trigger the server as well 🔃)
export type Endpoints = |"/find-user"|"/flower"|"/random-number"|"/article/[articleId]"|"/product/[productId]"|"/profile/[contact]"|"/users/[recordId]/[propertyId]/get"

import {onGet as endpoint0_onGet} from "./routes/find-user"
import {onPost as endpoint0_onPost} from "./routes/find-user"
import {onGet as endpoint1_onGet} from "./routes/flower"
import {onGet as endpoint2_onGet} from "./routes/random-number"
import {onPost as endpoint3_onPost} from "./routes/article/[articleId]"
import {onPost as endpoint4_onPost} from "./routes/product/[productId]"
import {onPost as endpoint5_onPost} from "./routes/profile/[contact]"
import {onGet as endpoint6_onGet} from "./routes/users/[recordId]/[propertyId]/get"


export type HandlerTypesByEndpointAndMethod = {
"/find-user":{
	"get": typeof endpoint0_onGet;
	"post": typeof endpoint0_onPost;
};
"/flower":{
	"get": typeof endpoint1_onGet;
};
"/random-number":{
	"get": typeof endpoint2_onGet;
};
"/article/[articleId]":{
	"post": typeof endpoint3_onPost;
};
"/product/[productId]":{
	"post": typeof endpoint4_onPost;
};
"/profile/[contact]":{
	"post": typeof endpoint5_onPost;
};
"/users/[recordId]/[propertyId]/get":{
	"get": typeof endpoint6_onGet;
};
}