//This is an automatically generated file. There is no need to update it manually. Manual updates will be overridden.
export type Endpoints = |"/find-user/"|"/product/[productId]/"|"/profile/[contact]/"|"/orgs/[orgName]/[repo]/"
import {onGet as endpoint0_onGet} from "~/routes/find-user/"
import {onPost as endpoint0_onPost} from "~/routes/find-user/"
import {onPost as endpoint1_onPost} from "~/routes/product/[productId]/"
import {onPost as endpoint2_onPost} from "~/routes/profile/[contact]/"
import {onGet as endpoint3_onGet} from "~/routes/orgs/[orgName]/[repo]/"
export interface HandlerTypesByRouteAndMethod {"/find-user/":{"get": typeof endpoint0_onGet;"post": typeof endpoint0_onPost;};"/product/[productId]/":{"post": typeof endpoint1_onPost;};"/profile/[contact]/":{"post": typeof endpoint2_onPost;};"/orgs/[orgName]/[repo]/":{"get": typeof endpoint3_onGet;};}