'use strict';

import * as _ from "lodash";
import * as express from "express";
import * as util from "util";

import Wrap from "./Wrap";
import RequestConfigGroup from "../models/RequestConfigGroup";
import RequestConfig from "../models/RequestConfig";

/**
 * @param {Object} [config={}]
 *
 * @returns {Function}
 * */
export default function Controller(config = {}) {
    config = _.merge({
        staticMode: false,
        immediate: false,
        sender: undefined
    }, config);
    return Wrap(function (target, key, type) {
        if (type == 'class') {
            target.isController = target.prototype.isController = true;
            target.getControllerConfig = target.prototype.getControllerConfig = () => config;

            target.getRouter = target.prototype.getRouter = function () {
                if (!(this.isConfigurated && this._requestConfigGroup && this._requestConfigGroup.router)) {
                    this.setupRouter();
                }
                return this._requestConfigGroup.router;
            };
            target.setupRouter = target.prototype.setupRouter = function () {
                let $this = this;
                let targetAux;
                if (util.isObject($this) && $this instanceof target) {
                    targetAux = target.prototype;
                } else if (util.isFunction($this) && $this === target) {
                    targetAux = target;
                }
                let router;
                if (targetAux && !this.isConfigurated &&
                    ((router = express.Router({mergeParams: true})) && (router = setupRouter.call(this, router, target, targetAux)))) {
                    this.isConfigurated = true;
                    this._requestConfigGroup = RequestConfigGroup.parse(this._requestConfigGroup || {});
                    this._requestConfigGroup.setRouter(router);
                }
            };

            if (config.immediate) target.setupRouter();
        }
    });
}

//region PRIVATE METHODS
function setupRouter(router, target, targetAux) {
    let $this = this;
    let config = $this.getControllerConfig();
    let sender = config.sender;
    let validator = config.validator;

    let methodNames = Object.getOwnPropertyNames(targetAux);
    for (let methodName of methodNames) {
        let methodAux = targetAux[methodName];
        if (methodName != 'constructor' && methodAux && util.isFunction(methodAux) &&
            !util.isUndefined(methodAux._requestConfig) && (methodAux._requestConfig instanceof RequestConfig)
            && util.isString(methodAux._requestConfig.method)) {
            let requestConfig = methodAux._requestConfig;

            if (!util.isUndefined(target._requestConfigGroup) && (
                    target._requestConfigGroup instanceof RequestConfigGroup
                )) {
                target._requestConfigGroup.getRequestConfigs()
                    .forEach(function (options) {
                        if (!_.includes(options.excludeMethods, methodName)
                            && (!options.targetMethods || !options.targetMethods.length
                                || _.includes(options.targetMethods, methodName))) {
                            requestConfig.updateConfigs(options);
                        }
                    });
            }

            if (requestConfig.params && requestConfig.params.length > 0) {
                fillParams(requestConfig.router, requestConfig.params);
            }

            let middlewares = [];
            if (requestConfig.query) middlewares.push(fillQueries(requestConfig.query, validator));
            if (requestConfig.bodyExpected) middlewares.push(fillBodies(requestConfig.bodyExpected, validator));
            middlewares = middlewares.concat(requestConfig.middlewares, requestConfig.target, requestConfig.interceptors);
            if (sender) middlewares.push(sender);

            middlewares = _.map(middlewares, item => item.bind($this));
            for (let route of requestConfig.routes) {
                if (Array.isArray(requestConfig.prefix) && requestConfig.prefix.length > 0) {
                    for (let prefix of requestConfig.prefix) {
                        setRoute(requestConfig, prefix, route, middlewares);
                    }
                } else {
                    setRoute(requestConfig, "", route, middlewares);
                }
            }
            router.use(targetAux[methodName] = requestConfig.router);
        }
    }
    return router;
}

function setRoute(requestConfig, prefix, route, middlewares) {
    requestConfig
        .router[requestConfig.method]
        .call(requestConfig.router, prefix + route, middlewares);
}

function fillParams(router, params) {
    router.param(function testRegExp(name, fn) {
        if (fn instanceof RegExp) {
            return function (req, res, next, val) {
                if (fn.test(String(val))) {
                    next();
                } else next('not valid');
            }
        }
    });
    for (let param of params) {
        if (!param[0] || util.isArray(param[0]) && param[0].length == 0) continue;
        let subParams = param[0];
        let subFns = param[1];
        if (!util.isArray(subParams)) subParams = [subParams];
        if (!util.isArray(subFns)) subFns = [subFns];
        for (let subFn of subFns) {
            if (subFn) {
                for (let subParam of subParams) {
                    if (subParam) router.param(subParam, subFn);
                }
            }
        }
    }
}

function fillBodies(querySchema, validator) {
    return generateValidatorMiddleware('body', querySchema, validator);
}

function fillQueries(querySchema, validator) {
    return generateValidatorMiddleware('query', querySchema, validator);
}

function generateValidatorMiddleware(field, schema, validator) {
    return function validatorMiddleware(req, res, next) {
        return validate(validator, req[field], schema, req, next);
    }
}

async function validate(validator, value, schema, req, next) {
    try {
        let result = validator(value, schema, req);
        if (result instanceof Promise) result = await result;
        if (util.isBoolean(result) && result) next();
        else if (!result) next(false);
        else next(result);
    } catch (e) {
        next(e);
    }
}

//endregion