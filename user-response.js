"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.updateRequestCtx = exports.convertToTypeFromString = exports.buildInputsFromQueryParams = exports.buildInputsFromRequestBody = exports.loadUserResponse = void 0;
var headers_1 = require("./headers");
var http_status_codes_1 = require("./http-status-codes");
var redirect_handler_1 = require("./redirect-handler");
var error_handler_1 = require("./error-handler");
var cookie_1 = require("./cookie");
function loadUserResponse(requestCtx, params, routeModules, trailingSlash, basePathname) {
    if (basePathname === void 0) { basePathname = '/'; }
    return __awaiter(this, void 0, void 0, function () {
        var request, url, platform, pathname, isPageModule, isPageDataRequest, type, userResponse, hasRequestMethodHandler, routeModuleIndex, abort, redirect, error, next, _i, _a, setCookieValue;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (routeModules.length === 0) {
                        throw new error_handler_1.ErrorResponse(http_status_codes_1.HttpStatus.NotFound, "Not Found");
                    }
                    request = requestCtx.request, url = requestCtx.url, platform = requestCtx.platform;
                    pathname = url.pathname;
                    isPageModule = isLastModulePageRoute(routeModules);
                    isPageDataRequest = isPageModule && request.headers.get('Accept') === 'application/json';
                    type = isPageDataRequest ? 'pagedata' : isPageModule ? 'pagehtml' : 'endpoint';
                    userResponse = {
                        type: type,
                        url: url,
                        params: params,
                        status: http_status_codes_1.HttpStatus.Ok,
                        headers: (0, headers_1.createHeaders)(),
                        resolvedBody: undefined,
                        pendingBody: undefined,
                        cookie: new cookie_1.Cookie(request.headers.get('cookie')),
                        aborted: false
                    };
                    hasRequestMethodHandler = false;
                    if (isPageModule && pathname !== basePathname) {
                        // only check for slash redirect on pages
                        if (trailingSlash) {
                            // must have a trailing slash
                            if (!pathname.endsWith('/')) {
                                // add slash to existing pathname
                                throw new redirect_handler_1.RedirectResponse(pathname + '/' + url.search, http_status_codes_1.HttpStatus.Found);
                            }
                        }
                        else {
                            // should not have a trailing slash
                            if (pathname.endsWith('/')) {
                                // remove slash from existing pathname
                                throw new redirect_handler_1.RedirectResponse(pathname.slice(0, pathname.length - 1) + url.search, http_status_codes_1.HttpStatus.Found);
                            }
                        }
                    }
                    routeModuleIndex = -1;
                    abort = function () {
                        routeModuleIndex = ABORT_INDEX;
                    };
                    redirect = function (url, status) {
                        return new redirect_handler_1.RedirectResponse(url, status, userResponse.headers);
                    };
                    error = function (status, message) {
                        return new error_handler_1.ErrorResponse(status, message);
                    };
                    next = function () { return __awaiter(_this, void 0, void 0, function () {
                        var endpointModule, reqHandler, response, urlObject, method, inputs, _a, requestEv, syncData, asyncResolved;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    routeModuleIndex++;
                                    _b.label = 1;
                                case 1:
                                    if (!(routeModuleIndex < routeModules.length)) return [3 /*break*/, 9];
                                    endpointModule = routeModules[routeModuleIndex];
                                    reqHandler = undefined;
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
                                    if (!(typeof reqHandler === 'function')) return [3 /*break*/, 8];
                                    hasRequestMethodHandler = true;
                                    response = {
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
                                        redirect: redirect,
                                        error: error
                                    };
                                    urlObject = new URL(url);
                                    console.log('Search params', urlObject.searchParams);
                                    console.log('Request method:', request.method);
                                    method = request.method;
                                    if (!(!method || method === "GET")) return [3 /*break*/, 2];
                                    _a = (0, exports.buildInputsFromQueryParams)(urlObject.searchParams);
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, (0, exports.buildInputsFromRequestBody)(request)];
                                case 3:
                                    _a = _b.sent();
                                    _b.label = 4;
                                case 4:
                                    inputs = _a;
                                    requestEv = {
                                        request: request,
                                        url: urlObject,
                                        params: __assign({}, params),
                                        response: response,
                                        platform: platform,
                                        cookie: userResponse.cookie,
                                        inputs: inputs,
                                        next: next,
                                        abort: abort
                                    };
                                    syncData = reqHandler(requestEv);
                                    if (!(typeof syncData === 'function')) return [3 /*break*/, 5];
                                    // sync returned function
                                    userResponse.pendingBody = createPendingBody(syncData);
                                    return [3 /*break*/, 8];
                                case 5:
                                    if (!(syncData !== null &&
                                        typeof syncData === 'object' &&
                                        typeof syncData.then === 'function')) return [3 /*break*/, 7];
                                    return [4 /*yield*/, syncData];
                                case 6:
                                    asyncResolved = _b.sent();
                                    if (typeof asyncResolved === 'function') {
                                        // async resolved function
                                        userResponse.pendingBody = createPendingBody(asyncResolved);
                                    }
                                    else {
                                        // async resolved data
                                        userResponse.resolvedBody = asyncResolved;
                                    }
                                    return [3 /*break*/, 8];
                                case 7:
                                    // sync returned data
                                    userResponse.resolvedBody = syncData;
                                    _b.label = 8;
                                case 8:
                                    routeModuleIndex++;
                                    return [3 /*break*/, 1];
                                case 9: return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, next()];
                case 1:
                    _b.sent();
                    userResponse.aborted = routeModuleIndex >= ABORT_INDEX;
                    for (_i = 0, _a = userResponse.cookie.headers(); _i < _a.length; _i++) {
                        setCookieValue = _a[_i];
                        userResponse.headers.set('Set-Cookie', setCookieValue);
                    }
                    if (!isPageDataRequest &&
                        (0, redirect_handler_1.isRedirectStatus)(userResponse.status) &&
                        userResponse.headers.has('Location')) {
                        // user must have manually set redirect instead of throw response.redirect()
                        // never render the page if the user manually set the status to be a redirect
                        throw new redirect_handler_1.RedirectResponse(userResponse.headers.get('Location'), userResponse.status, userResponse.headers);
                    }
                    // this is only an endpoint, and not a page module
                    if (type === 'endpoint' && !hasRequestMethodHandler) {
                        // didn't find any handlers
                        throw new error_handler_1.ErrorResponse(http_status_codes_1.HttpStatus.MethodNotAllowed, "Method Not Allowed");
                    }
                    return [2 /*return*/, userResponse];
            }
        });
    });
}
exports.loadUserResponse = loadUserResponse;
var buildInputsFromRequestBody = function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var text;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, request.text()];
            case 1:
                text = _a.sent();
                try {
                    return [2 /*return*/, JSON.parse(text)];
                }
                catch (_b) {
                    return [2 /*return*/, { _body_text: text }];
                }
                return [2 /*return*/];
        }
    });
}); };
exports.buildInputsFromRequestBody = buildInputsFromRequestBody;
var buildInputsFromQueryParams = function (queryParams) {
    var inputs = {};
    queryParams.forEach(function (value, key) {
        inputs[key] = (0, exports.convertToTypeFromString)(value);
    });
    return inputs;
};
exports.buildInputsFromQueryParams = buildInputsFromQueryParams;
var convertToTypeFromString = function (str) {
    if (str.trim().startsWith("{") || str.trim().startsWith("[")) {
        try {
            return JSON.parse(str);
        }
        catch (_a) {
            return convertToPrimitiveFromString(str);
        }
    }
    else {
        return convertToPrimitiveFromString(str);
    }
};
exports.convertToTypeFromString = convertToTypeFromString;
var convertToPrimitiveFromString = function (str) {
    if (str === "null")
        return null;
    if (str === "undefined")
        return undefined;
    if (str === "true")
        return true;
    if (str === "false")
        return false;
    var number = Number(str);
    if (!Number.isNaN(number))
        return number;
    else
        return str;
};
function createPendingBody(cb) {
    return new Promise(function (resolve, reject) {
        try {
            var rtn = cb();
            if (rtn !== null && typeof rtn === 'object' && typeof rtn.then === 'function') {
                // callback return promise
                rtn.then(resolve, reject);
            }
            else {
                // callback returned data
                resolve(rtn);
            }
        }
        catch (e) {
            // sync callback errored
            reject(e);
        }
    });
}
function isLastModulePageRoute(routeModules) {
    var lastRouteModule = routeModules[routeModules.length - 1];
    return lastRouteModule && typeof lastRouteModule["default"] === 'function';
}
function updateRequestCtx(requestCtx, trailingSlash) {
    var pathname = requestCtx.url.pathname;
    if (pathname.endsWith(QDATA_JSON)) {
        requestCtx.request.headers.set('Accept', 'application/json');
        var trimEnd = pathname.length - QDATA_JSON_LEN + (trailingSlash ? 1 : 0);
        pathname = pathname.slice(0, trimEnd);
        if (pathname === '') {
            pathname = '/';
        }
        requestCtx.url.pathname = pathname;
    }
}
exports.updateRequestCtx = updateRequestCtx;
var QDATA_JSON = '/q-data.json';
var QDATA_JSON_LEN = QDATA_JSON.length;
var ABORT_INDEX = 999999999;
