import {ActiveParamsType} from "../../../types/active-params.type";
import {CommonConstants} from "../constants/common.constants";
import {Params} from "@angular/router";

export class ActiveParamUtil {
  static processParams(params: Params): ActiveParamsType {
    const activeParams: ActiveParamsType = {types: []}

    if (params.hasOwnProperty(CommonConstants.types)) {
      activeParams.types = Array.isArray(params[CommonConstants.types])
        ? params[CommonConstants.types]
        : [params[CommonConstants.types]];
    }
    if (params.hasOwnProperty(CommonConstants.heightTo)) {
      activeParams.heightTo = params[CommonConstants.heightTo];
    }
    if (params.hasOwnProperty(CommonConstants.heightFrom)) {
      activeParams.heightFrom = params[CommonConstants.heightFrom];
    }
    if (params.hasOwnProperty(CommonConstants.diameterTo)) {
      activeParams.diameterTo = params[CommonConstants.diameterTo];
    }
    if (params.hasOwnProperty(CommonConstants.diameterFrom)) {
      activeParams.diameterFrom = params[CommonConstants.diameterFrom];
    }
    if (params.hasOwnProperty(CommonConstants.sort)) {
      activeParams.sort = params[CommonConstants.sort];
    }
    if (params.hasOwnProperty(CommonConstants.page)) {
      activeParams.page = +params[CommonConstants.page];
    }

    return activeParams;
  }
}
