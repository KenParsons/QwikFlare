//This is an automatically generated file. There is no need to update it manually.
//If you added or removed a route and it's not showing here, restart your dev server 🔁
//(and after you may need to refresh your browser page to trigger the server as well 🔃)
export type Endpoints = | "/find-user" | "/flower" | "/article/[articleId]" | "/product/[productId]" | "/profile/[contact]" | "/random-number/[somethingParam]" | "/users/[recordId]/[propertyId]/get"

import { onGet as endpoint0_onGet } from "./routes/find-user"
import { onPost as endpoint0_onPost } from "./routes/find-user"
import { onGet as endpoint1_onGet } from "./routes/flower"
import { onPost as endpoint2_onPost } from "./routes/article/[articleId]"
import { onPost as endpoint3_onPost } from "./routes/product/[productId]"
import { onPost as endpoint4_onPost } from "./routes/profile/[contact]"
import { onGet as endpoint5_onGet } from "./routes/random-number/[somethingParam]"
import { onGet as endpoint6_onGet } from "./routes/users/[recordId]/[propertyId]/get"


export interface HandlerTypesByRouteAndMethod {
	"/find-user": {
		"get": typeof endpoint0_onGet;
		"post": typeof endpoint0_onPost;
	};
	"/flower": {
		"get": typeof endpoint1_onGet;
	};
	"/article/[articleId]": {
		"post": typeof endpoint2_onPost;
	};
	"/product/[productId]": {
		"post": typeof endpoint3_onPost;
	};
	"/profile/[contact]": {
		"post": typeof endpoint4_onPost;
	};
	"/random-number/[somethingParam]": {
		"get": typeof endpoint5_onGet;
	};
	"/users/[recordId]/[propertyId]/get": {
		"get": typeof endpoint6_onGet;
	};
}

type TrueIfHasOnGet<T extends keyof HandlerTypesByRouteAndMethod> = "get" extends keyof HandlerTypesByRouteAndMethod[T] ? true : false

type TrueIfHasOnGetByRoute = {
	[Route in keyof HandlerTypesByRouteAndMethod]: TrueIfHasOnGet<Route>;
}

type KeysMatching<Object, DesiredType> = { [Key in keyof Object]-?: Object[Key] extends DesiredType ? Key : never }[keyof Object];
//Incredible. Further details here: https://stackoverflow.com/questions/54520676/in-typescript-how-to-get-the-keys-of-an-object-type-whose-values-are-of-a-given

type RoutesWithOnGet = KeysMatching<TrueIfHasOnGetByRoute, true>;

type OnGetHandlersByRoute = {
	[Route in RoutesWithOnGet]: HandlerTypesByRouteAndMethod[Route]["get"]
}

export type RoutesThatUseThisOnGetHandler<Handler> = KeysMatching<OnGetHandlersByRoute, Handler>;
