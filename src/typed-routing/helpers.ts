import { EndpointMethodInputs as TypedParamsOf } from "~/qwik-city/runtime/src/library/types";
import { HandlerTypesByRouteAndMethod } from "./endpoint-types";
import { PathParamsByRoute } from "./route-types";


//Note that this doesn't keep positional information
//So this would fail in the weird case where someone did /path/path/[id]/path/[id] or something
//like that where they used the exact same param name in multiple spots
//We can account for that, but just getting the working version out so y'all can feel it out as an API
export function route<Route extends keyof PathParamsByRoute>
  (
    ...args: PathParamsByRoute[Route] extends null ?
      DoOnGetInputsExist<Route> extends true ? [route: Route, params: OnGetInputsIfTheyExist<Route>] :
      [route: Route]
      : [route: Route, params: PathParamsByRoute[Route] & OnGetInputsIfTheyExist<Route>]
  ) {



  const [route, params] = args;
  let path = route as string;
  const pathParams: Record<string, boolean> = {};
  for (const slug of path.split("/")) {
    if (slug.startsWith('[') && slug.endsWith(']')) {
      const startIndex = slug.startsWith("[...") ? 4 : 1;
      pathParams[slug.slice(startIndex, -1)] = true;
    }
  }

  let queryParams = "";
  if (params) {
    for (const param in params) {
      const passedString: string = (params as any)[param]
      if (pathParams[param]) {
        path = path.replace(`/[${param}]`, `/${passedString}`);
        path = path.replace(`/[...${param}]`, `/${passedString}`);

      } else {
        const value = (params as any)[param];
        const stringified = (typeof (value) === "object") ? JSON.stringify(value) : value;
        queryParams += `${param}=${stringified}&`
      }
    }


  }

  if (queryParams) {
    path = path + "?" + queryParams.slice(0, -1) //trailing &
  }
  return path;
}


type DoOnGetInputsExist<Route> = Route extends keyof HandlerTypesByRouteAndMethod ? "get" extends keyof HandlerTypesByRouteAndMethod[Route] ?
  TypedParamsOf<HandlerTypesByRouteAndMethod[Route]["get"]> extends undefined ?
  false : true : false : false

type OnGetInputsIfTheyExist<Route extends keyof PathParamsByRoute> = Route extends keyof HandlerTypesByRouteAndMethod ? "get" extends keyof HandlerTypesByRouteAndMethod[Route] ?
  TypedParamsOf<HandlerTypesByRouteAndMethod[Route]["get"]> extends undefined ?
  {} : TypedParamsOf<HandlerTypesByRouteAndMethod[Route]["get"]> : {} : {}
