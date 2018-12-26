'use strict';

import * as util from "util";
import RequestConfig from "./RequestConfig";
import * as express from "express";


export default class RequestConfigGroup {
    //region FIELDS
    public requestConfigs : Array<RequestConfig>;
    public router : express.Router;
    //endregion

    //region CONSTRUCTOR
    /**
     * @constructor
     * @param {Object|RequestConfigGroup} [options]
     * @param {Array<RequestConfig>} [options.requestConfigs]
     * */
    constructor(options?) {
        if (!util.isUndefined(options)) {
            if (util.isArray(options.requestConfigs) && options.requestConfigs.length > 0) {
                this.requestConfigs = options.requestConfigs;
            }
            if (!util.isUndefined(options.router)) this.setRouter(options.router);
        }
    }

    //endregion

    //region PUBLIC METHODS
    /**
     * @param {Object|RequestConfig} options
     * */
    addRequestConfig(options) {
        if (!(options instanceof RequestConfig)) options = new RequestConfig(options);
        this.getRequestConfigs().push(options);
    }

    /**
     * @returns {Array<RequestConfig>}
     * */
    getRequestConfigs() : Array<RequestConfig> {
        if (!util.isArray(this.requestConfigs)) this.requestConfigs = [];
        return this.requestConfigs;
    }

    setRouter(router : express.Router) {
        if (util.isUndefined(this.router)) {
            this.router = router;
        }
    }

    //endregion

    //region STATIC METHODS
    /**
     * @static
     * @param {Object|RequestConfigGroup} options
     * @returns {RequestConfigGroup}
     * */
    static parse(options) {
        if (util.isObject(options) && !(options instanceof RequestConfigGroup)) {
            options = new RequestConfigGroup(options);
        }
        return options;
    }

    //endregion

}