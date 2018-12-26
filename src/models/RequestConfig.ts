'use strict';

import * as util from "util";
import * as _ from "lodash";
import * as express from "express";


/**
 * @class
 * */
export default class RequestConfig {
    //region FIELDS
    private _method : String;
    public query : Object;
    public bodyExpected : Object;
    public prefix : Array<String>;
    public routes : Array<String>;
    public params : Array<any>;
    public middlewares : Array<Function>;
    public interceptors : Array<Function>;
    public targetMethods? : Array<String>;
    public excludeMethods? : Array<String>;

    public router : express.Router;
    public target : any;
    //endregion

    //region CONSTRUCTOR
    /**
     * @constructor
     * @param {Object} [options]
     * @param {String} [options.method="use"]
     * @param {Object} [options.query]
     * @param {Object} [options.bodyExpected]
     * @param {Array.<String>} [options.prefix]
     * @param {Array.<String>|String} [options.routes]
     * @param {Array.<String>} [options.params]
     * @param {Array.<Function>} [options.middlewares]
     * @param {Array.<Function>} [options.interceptors]
     * @param {Object} [subOptions]
     * @param {Array.<String>} [subOptions.targetMethods]
     * @param {Array.<String>} [subOptions.excludeMethods]
     * */
    constructor(options : any, subOptions? : any) {
        options = _.defaults(options, {
            method: null,
            routes: [],
            prefix: [],
            middlewares: [],
            interceptors: []
        });
        if (options.method) this.method = options.method.toLowerCase();
        if (options.query) this.query = options.query;
        if (options.bodyExpected) this.bodyExpected = options.bodyExpected;
        if (options.prefix) this.prefix = itemToArray(options.prefix);
        if (options.routes) this.routes = itemToArray(options.routes);
        if (options.params) {
            if (util.isArray(options.params) && options.params.length > 0) {
                options.params = [options.params];
                if (options.params.length > 1) {
                    options.params = [...options.params];
                }
            }
            this.params = itemToArray(options.params);
        }
        if (options.middlewares) this.middlewares = itemToArray(options.middlewares);
        if (options.interceptors) this.interceptors = itemToArray(options.interceptors);
        if (util.isObject(subOptions)) {
            if (util.isArray(subOptions.targetMethods)) {
                this.targetMethods = itemToArray(subOptions.targetMethods);
            }
            if (util.isArray(subOptions.excludeMethods)) {
                this.excludeMethods = itemToArray(subOptions.excludeMethods);
            }
        }
    }

    //endregion

    //region GETTER AND SETTER METHODS
    /**
     * @property
     * @param {String} method
     * */
    set method(method : String) {
        if (!util.isString(method)) return;
        this._method = method;
    }

    /**
     * @property
     * @returns {String}
     * */
    get method() : String {
        return this._method;
    }

    //endregion

    //region PUBLIC METHODS
    setTarget(target : any) {
        this.target = target;
    }

    setRouter(router : express.Router) {
        if (util.isUndefined(this.router)) {
            this.router = router;
        }
    }

    /**
     * @param {Object|RequestConfig} [options={}]
     * @param {Object} [options.query]
     * @param {Object} [options.bodyExpected]
     * @param {Array.<String>} [options.prefix]
     * @param {Array.<String>} [options.routes]
     * @param {Array.<String>} [options.params]
     * @param {Array.<Function>} [options.middlewares]
     * @param {Array.<Function>} [options.interceptors]
     * */
    updateConfigs(options) {
        if (isArrayNoEmpty(options.interceptors)) {
            this.interceptors = concat(options.interceptors, this.interceptors);
        }
        if (isArrayNoEmpty(options.middlewares)) {
            this.middlewares = concat(options.middlewares, this.middlewares);
        }
        if (isArrayNoEmpty(options.params)) {
            this.params = concat(options.params, this.params);
        }
        if (isArrayNoEmpty(options.routes)) {
            this.routes = concat(options.routes, this.routes);
        }
        if (isArrayNoEmpty(options.prefix)) {
            this.prefix = concat(options.prefix, this.prefix);
        }
        if (util.isObject(options.query)) this.query = options.query;
        if (util.isObject(options.bodyExpected)) this.bodyExpected = options.bodyExpected;
        if (util.isString(options.method)) this.method = options.method.toLowerCase();
    }

    //endregion

    //region STATIC METHODS
    /**
     * @static
     * @param {Object|RequestConfig} options
     * @returns {RequestConfig}
     * */
    static parse(options) {
        if (util.isObject(options) && !(options instanceof RequestConfig)) {
            options = new RequestConfig(options);
        }
        return options;
    }

    //endregion

}

//region PRIVATE METHODS
/**
 * @param {Array|any} item
 * @returns {Array}
 * */
function itemToArray(item) {
    if (!util.isArray(item) && !util.isUndefined(item)) item = [item];
    return item;
}

/**
 * @param {Array} itemA
 * @param {Array} itemB
 * @returns {Array}
 * */
function concat(itemA, itemB) {
    if (!isArrayNoEmpty(itemB)) return itemA;
    return itemA.concat(itemB);
}

/**
 * @param {Array} array
 * @returns {Boolean}
 * */
function isArrayNoEmpty(array) {
    return (util.isArray(array) && array.length > 0);
}

//endregion