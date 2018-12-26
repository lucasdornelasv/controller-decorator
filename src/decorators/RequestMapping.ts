'use strict';

import * as express from "express";
import * as util from "util";

import Wrap from "./Wrap";
import RequestConfig from "../models/RequestConfig";
import RequestConfigGroup from "../models/RequestConfigGroup";


/**
 * @param {Object|Array|String} [options={}]
 * @param {Array<String>|String} [options.routes]
 * @param {Object} [subOptions]
 *
 * @returns {Function}
 * */
export default function RequestMapping(options = {}, subOptions?) : Function {
    if (util.isString(options) || util.isArray(options)) options = {prefix: options};

    if (util.isObject(subOptions) && subOptions.targetMethods && subOptions.excludeMethods) {
        subOptions = {
            targetMethods: subOptions.targetMethods,
            excludeMethods: subOptions.excludeMethods
        };
    }
    let requestConfig = new RequestConfig(options, subOptions);
    return Wrap(function (target, key, type) {
        let isClass = type === 'class';

        let router;
        if (!util.isUndefined(target) && !util.isUndefined(requestConfig.routes)) {
            if (isClass) {
                if (util.isUndefined(target._requestConfigGroup) ||
                    !(target._requestConfigGroup instanceof RequestConfigGroup)) {
                    target._requestConfigGroup = new RequestConfigGroup();
                }
                target._requestConfigGroup.addRequestConfig(requestConfig);
            } else {
                let hasRequestConfig = !(util.isUndefined(target._requestConfig) ||
                    !(target._requestConfig instanceof RequestConfig));
                if(((hasRequestConfig && (router = target._requestConfig.router))
                    || (router = express.Router({mergeParams: true})))){
                    if (hasRequestConfig) {
                        target._requestConfig.updateConfigs(requestConfig);
                    }else{
                        requestConfig.setTarget(target);
                        requestConfig.setRouter(router);
                        target._requestConfig = requestConfig;
                    }
                }
            }
        }
    })
}