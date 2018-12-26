'use strict';

import FunctionUtils from "../utils/FunctionUtils";
import * as util from "util";
import BaseResponse from "../models/responses/BaseResponse";
import Wrap from "./Wrap";

export default function WrapMiddleware(options) {
    return Wrap(function (target, key?, type?, context?) {
        if (type == 'function') return wrapPromiseResponse(target, options);
    });
}

//region PRIVATE METHODS
/**
 * @private
 * @param {Function} method
 * @param {Object|Array.<Function>|Function} [options]
 * @param {Array.<Function>|Function} [options.interceptors]
 *
 * @returns {Function}
 * */
function wrapPromiseResponse(method, options) {
    if (util.isFunction(options)) options.interceptors = [options];
    let name = method.name;

    return FunctionUtils.wrapName(name, function wrapperTargetMiddleware(req, res, next) {
        return new Promise((resolve, reject) => {
            try {
                resolve(method.call(this, req, res, next));
            } catch (e) {
                reject(e);
            }
        })
            .then(filterResponse)
            .then(response => {
                next(response);
                return response;
            })
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