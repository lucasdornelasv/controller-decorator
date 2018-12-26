'use strict';

import * as util from "util";
import * as _ from "lodash";
import TypeUtils from "../../../_common/utils/TypeUtils";
import FunctionUtils from "../../../_common/utils/FunctionUtils";
import WrapResponseInterceptor from "../../../api/interceptors/WrapResponseInterceptor";
import Wrap from "./Wrap";
import BaseResponse from "../../../api/models/responses/BaseResponse";

export default function WrapResponse(options) {
    return Wrap(function (target, key, type, context) {
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
function wrapPromiseResponse(method, options = {}) {
    if (util.isFunction(options)) options.interceptors = [options];
    let name = method.name;
    method = TypeUtils.isGeneratorFunction(method) ? require("bluebird").coroutine(method) : method;

    if (hasItems(options.interceptors)) method = applyInterceptors(method, options.interceptors);
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
 * @param {Function} method
 * @param {Array.<WrapResponseInterceptor>} interceptors
 *
 * @returns {Function}
 * */
function applyInterceptors(method, interceptors) {
    interceptors = _.chain(interceptors)
        .map(WrapResponseInterceptor.parse)
        .filter(o => !!o)
        .value();
    return function wrapperMethodWithInterceptors(req, res, next) {
        let $this = this;
        let responsePromise = new Promise((resolve, reject) => {
            try {
                resolve(method.call($this, req, res, next))
            } catch (e) {
                reject(e);
            }
        });
        for (let interceptor of interceptors) {
            responsePromise = interceptor
                .wrapThen(fn => response => fn.call($this, response, req, res, next))
                .wrapCatch(fn => err => fn.call($this, err, req, res, next))
                .applyPromise(responsePromise);
        }
        return responsePromise;
    }
}

/**
 * @private
 * @param {*} arr
 *
 * @returns {Boolean}
 * */
function hasItems(arr) {
    return (util.isArray(arr) && arr.length > 0);
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