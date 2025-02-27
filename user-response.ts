import { createHeaders } from './headers';
import type {
    RequestHandler,
    PageModule,
    RequestEvent,
    ResponseContext,
    RouteModule,
    RouteParams,
} from '../../runtime/src/library/types';
import type { QwikCityRequestContext, UserResponseContext } from './types';
import { HttpStatus } from './http-status-codes';
import { isRedirectStatus, RedirectResponse } from './redirect-handler';
import { ErrorResponse } from './error-handler';
import { Cookie } from './cookie';
import type { RequestContext } from '@builder.io/qwik-city';

export async function loadUserResponse(
    requestCtx: QwikCityRequestContext,
    params: RouteParams,
    routeModules: RouteModule[],
    trailingSlash?: boolean,
    basePathname: string = '/'
) {
    if (routeModules.length === 0) {
        throw new ErrorResponse(HttpStatus.NotFound, `Not Found`);
    }

    const { request, url, platform } = requestCtx;
    const { pathname } = url;
    const isPageModule = isLastModulePageRoute(routeModules);
    const isPageDataRequest = isPageModule && request.headers.get('Accept') === 'application/json';
    const type = isPageDataRequest ? 'pagedata' : isPageModule ? 'pagehtml' : 'endpoint';

    const userResponse: UserResponseContext = {
        type,
        url,
        params,
        status: HttpStatus.Ok,
        headers: createHeaders(),
        resolvedBody: undefined,
        pendingBody: undefined,
        cookie: new Cookie(request.headers.get('cookie')),
        aborted: false,
    };

    let hasRequestMethodHandler = false;

    if (isPageModule && pathname !== basePathname) {
        // only check for slash redirect on pages
        if (trailingSlash) {
            // must have a trailing slash
            if (!pathname.endsWith('/')) {
                // add slash to existing pathname
                throw new RedirectResponse(pathname + '/' + url.search, HttpStatus.Found);
            }
        } else {
            // should not have a trailing slash
            if (pathname.endsWith('/')) {
                // remove slash from existing pathname
                throw new RedirectResponse(
                    pathname.slice(0, pathname.length - 1) + url.search,
                    HttpStatus.Found
                );
            }
        }
    }

    let routeModuleIndex = -1;

    const abort = () => {
        routeModuleIndex = ABORT_INDEX;
    };

    const redirect = (url: string, status?: number) => {
        return new RedirectResponse(url, status, userResponse.headers);
    };

    const error = (status: number, message?: string) => {
        return new ErrorResponse(status, message);
    };

    const next = async () => {
        routeModuleIndex++;

        while (routeModuleIndex < routeModules.length) {
            const endpointModule = routeModules[routeModuleIndex];

            let reqHandler: RequestHandler | undefined = undefined;

            switch (request.method) {
                case 'GET': {
                    reqHandler = endpointModule.onGet;
                    break;
                }
                case 'POST': {
                    reqHandler = endpointModule.onPost;
                    break;
                }
                case 'PUT': {
                    reqHandler = endpointModule.onPut;
                    break;
                }
                case 'PATCH': {
                    reqHandler = endpointModule.onPatch;
                    break;
                }
                case 'OPTIONS': {
                    reqHandler = endpointModule.onOptions;
                    break;
                }
                case 'HEAD': {
                    reqHandler = endpointModule.onHead;
                    break;
                }
                case 'DELETE': {
                    reqHandler = endpointModule.onDelete;
                    break;
                }
            }

            reqHandler = reqHandler || endpointModule.onRequest;

            if (typeof reqHandler === 'function') {
                hasRequestMethodHandler = true;

                const response: ResponseContext = {
                    get status() {
                        return userResponse.status;
                    },
                    set status(code) {
                        userResponse.status = code;
                    },
                    get headers() {
                        return userResponse.headers;
                    },
                    get locale() {
                        return requestCtx.locale;
                    },
                    set locale(locale) {
                        requestCtx.locale = locale;
                    },
                    redirect,
                    error,
                };

                // create user request event, which is a narrowed down request context

                // const text = await request.text();
                // const method = request.method;

                const urlObject = new URL(url);
                const method = request.method;

                const inputs = (!method || method === "GET") ? buildInputsFromQueryParams(urlObject.searchParams) : await buildInputsFromRequestBody(request)
                const requestEv: RequestEvent = {
                    request,
                    url: urlObject,
                    params: { ...params },
                    response,
                    platform,
                    cookie: userResponse.cookie,
                    inputs,
                    next,
                    abort,
                };


                const syncData = reqHandler(requestEv) as any;

                if (typeof syncData === 'function') {
                    // sync returned function
                    userResponse.pendingBody = createPendingBody(syncData);
                } else if (
                    syncData !== null &&
                    typeof syncData === 'object' &&
                    typeof syncData.then === 'function'
                ) {
                    // async returned promise
                    const asyncResolved = await syncData;
                    if (typeof asyncResolved === 'function') {
                        // async resolved function
                        userResponse.pendingBody = createPendingBody(asyncResolved);
                    } else {
                        // async resolved data
                        userResponse.resolvedBody = asyncResolved;
                    }
                } else {
                    // sync returned data
                    userResponse.resolvedBody = syncData;
                }
            }

            routeModuleIndex++;
        }
    };

    await next();

    userResponse.aborted = routeModuleIndex >= ABORT_INDEX;

    for (const setCookieValue of userResponse.cookie.headers()) {
        userResponse.headers.set('Set-Cookie', setCookieValue);
    }

    if (
        !isPageDataRequest &&
        isRedirectStatus(userResponse.status) &&
        userResponse.headers.has('Location')
    ) {
        // user must have manually set redirect instead of throw response.redirect()
        // never render the page if the user manually set the status to be a redirect
        throw new RedirectResponse(
            userResponse.headers.get('Location')!,
            userResponse.status,
            userResponse.headers
        );
    }

    // this is only an endpoint, and not a page module
    if (type === 'endpoint' && !hasRequestMethodHandler) {
        // didn't find any handlers
        throw new ErrorResponse(HttpStatus.MethodNotAllowed, `Method Not Allowed`);
    }
    return userResponse;
}

export const buildInputsFromRequestBody = async (request: RequestContext) => {
    const text = await request.text();
    try {
        return JSON.parse(text) as { [key: string]: any };
    } catch {
        return { _body_text: text }
    }
}

export const buildInputsFromQueryParams = (queryParams: URLSearchParams) => {
    const inputs: { [key: string]: any } = {}
    queryParams.forEach((value, key) => {
        inputs[key] = convertToTypeFromString(value)
    });
    return inputs;
}

export const convertToTypeFromString = (str: string) => {
    if (str.trim().startsWith("{") || str.trim().startsWith("[")) {
        try {
            return JSON.parse(str)
        } catch {
            return convertToPrimitiveFromString(str);
        }
    } else {
        return convertToPrimitiveFromString(str);
    }

}

const convertToPrimitiveFromString = (str: string) => {
    if (str === "null") return null;
    if (str === "undefined") return undefined;
    if (str === "true") return true;
    if (str === "false") return false;
    const number = Number(str);
    if (!Number.isNaN(number)) return number
    else return str;
}


function createPendingBody(cb: () => any) {
    return new Promise<any>((resolve, reject) => {
        try {
            const rtn = cb();
            if (rtn !== null && typeof rtn === 'object' && typeof rtn.then === 'function') {
                // callback return promise
                rtn.then(resolve, reject);
            } else {
                // callback returned data
                resolve(rtn);
            }
        } catch (e) {
            // sync callback errored
            reject(e);
        }
    });
}

function isLastModulePageRoute(routeModules: RouteModule[]) {
    const lastRouteModule = routeModules[routeModules.length - 1];
    return lastRouteModule && typeof (lastRouteModule as PageModule).default === 'function';
}

export function updateRequestCtx(
    requestCtx: QwikCityRequestContext,
    trailingSlash: boolean | undefined
) {
    let pathname = requestCtx.url.pathname;

    if (pathname.endsWith(QDATA_JSON)) {
        requestCtx.request.headers.set('Accept', 'application/json');

        const trimEnd = pathname.length - QDATA_JSON_LEN + (trailingSlash ? 1 : 0);

        pathname = pathname.slice(0, trimEnd);
        if (pathname === '') {
            pathname = '/';
        }
        requestCtx.url.pathname = pathname;
    }
}

const QDATA_JSON = '/q-data.json';
const QDATA_JSON_LEN = QDATA_JSON.length;

const ABORT_INDEX = 999999999;
