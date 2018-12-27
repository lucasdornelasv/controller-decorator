'use strict';

import * as util from "util";
import Wrap from "./Wrap";
import FunctionUtils from "../utils/FunctionUtils";
import BaseResponse from "../models/responses/BaseResponse";

export default function WrapResponse(options) : Function{
    return Wrap(function (target, key?, type?, context?) {
        if (type == 'function') return wrapPromiseResponse(target, options);
    });
}

//region PRIVATE METHODS
/**
 * @private
 * @param {Function} method
 * @param {Object|Array.<Function>|Function} [options]
 *
 * @returns {Function}
 * */
function wrapPromiseResponse(method, options : any = {}) {
    let name = method.name;

    return FunctionUtils.wrapName(name, function wrapperTargetResponse(req, res, next) {
        return new Promise((resolve, reject) => {
            try {
                resolve(method.call(this, req));
            } catch (e) {
                reject(e);
            }
        })
            .then(filterResponse)
            .then(next)
            .catch(next);
    });
}

/**
 * @private
 * @param {*} response
 *
 * @return {*}
 * */
function filterResponse(response) {
    if (!util.isObject(response) || !(response instanceof BaseResponse)) {
        if (util.isBoolean(response) && response) response = undefined;
    }
    return response;
}

//endregion