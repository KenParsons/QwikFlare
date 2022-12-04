import { PathParamsByRoute } from '~/route-types';
import { HandlerTypesByEndpointAndMethod } from '~/endpoint-types';
import { MODULE_CACHE } from './constants';
import type {
  ContentMenu,
  EndpointMethodInputs,
  LoadedRoute,
  MenuData,
  MenuModule,
  ModuleLoader,
  RouteData,
  RouteModule,
  PathParams,
} from './types';

export const loadRoute = async (
  routes: RouteData[] | undefined,
  menus: MenuData[] | undefined,
  cacheModules: boolean | undefined,
  pathname: string
): Promise<LoadedRoute | null> => {
  if (Array.isArray(routes)) {
    for (const route of routes) {
      const match = route[0].exec(pathname);
      if (match) {
        const loaders = route[1];
        const params = getRouteParams(route[2], match);
        const routeBundleNames = route[4];
        const mods: RouteModule[] = new Array(loaders.length);
        const pendingLoads: Promise<any>[] = [];
        const menuLoader = getMenuLoader(menus, pathname);
        let menu: ContentMenu | undefined = undefined;

        loaders.forEach((moduleLoader, i) => {
          loadModule<RouteModule>(
            moduleLoader,
            pendingLoads,
            (routeModule) => (mods[i] = routeModule),
            cacheModules
          );
        });

        loadModule<MenuModule>(
          menuLoader,
          pendingLoads,
          (menuModule) => (menu = menuModule?.default),
          cacheModules
        );

        if (pendingLoads.length > 0) {
          await Promise.all(pendingLoads);
        }

        return [params, mods, menu, routeBundleNames];
      }
    }
  }
  return null;
};

const loadModule = <T>(
  moduleLoader: ModuleLoader | undefined,
  pendingLoads: Promise<any>[],
  moduleSetter: (loadedModule: T) => void,
  cacheModules: boolean | undefined
) => {
  if (typeof moduleLoader === 'function') {
    const loadedModule = MODULE_CACHE.get(moduleLoader);
    if (loadedModule) {
      moduleSetter(loadedModule);
    } else {
      const l: any = moduleLoader();
      if (typeof l.then === 'function') {
        pendingLoads.push(
          l.then((loadedModule: any) => {
            if (cacheModules !== false) {
              MODULE_CACHE.set(moduleLoader, loadedModule);
            }
            moduleSetter(loadedModule);
          })
        );
      } else if (l) {
        moduleSetter(l);
      }
    }
  }
};

const getMenuLoader = (menus: MenuData[] | undefined, pathname: string) => {
  if (menus) {
    const menu = menus.find(
      (m) => m[0] === pathname || pathname.startsWith(m[0] + (pathname.endsWith('/') ? '' : '/'))
    );
    if (menu) {
      return menu[1];
    }
  }
  return undefined;
};

export const getRouteParams = (paramNames: string[] | undefined, match: RegExpExecArray | null) => {
  const params: PathParams = {};

  if (paramNames) {
    for (let i = 0; i < paramNames.length; i++) {
      params[paramNames[i]] = match ? match[i + 1] : '';
    }
  }

  return params;
};

route("/article/[articleId]", {
  "age": 12,
  "articleId": 2342342,
  hey: 29802,
  title: "hello!"
})

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
  let queryParams = "";
  if (params) {
    for (const param in params) {

      const passedString: string = (params as any)[param]
      if (param.startsWith("[") && param.endsWith("]")) {
        path = path.replace(param, passedString)
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


// route("/flower")


type DoOnGetInputsExist<Route> = Route extends keyof HandlerTypesByEndpointAndMethod ? "get" extends keyof HandlerTypesByEndpointAndMethod[Route] ?
  EndpointMethodInputs<HandlerTypesByEndpointAndMethod[Route]["get"]> extends undefined ?
  false : true : false : false

type OnGetInputsIfTheyExist<Route extends keyof PathParamsByRoute> = Route extends keyof HandlerTypesByEndpointAndMethod ? "get" extends keyof HandlerTypesByEndpointAndMethod[Route] ?
  EndpointMethodInputs<HandlerTypesByEndpointAndMethod[Route]["get"]> extends undefined ?
  {} : EndpointMethodInputs<HandlerTypesByEndpointAndMethod[Route]["get"]> : {} : {}
