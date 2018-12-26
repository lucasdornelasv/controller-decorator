'use strict';

import * as _ from "lodash";
import * as util from "util";
import * as express from "express";
import * as fs from "fs";

const fsPromises = fs.promises;

export default class ControllerRegister {
    //region FIELDS
    public router : express.Application;
    //endregion

    //region CONSTRUCTOR
    /**
     * @constructor
     * @param {express.Application} router
     * */
    constructor(router : express.Application) {
        this.router = router;
    }

    //endregion

    //region STATIC METHODS
    /**
     * @static
     * @param {express.Application} router
     * @returns {ControllerRegister}
     * */
    static with(router : express.Application) {
        return new ControllerRegister(router);
    }

    /**
     * @static
     * @param {Function|Object} [Controller]
     * @returns {boolean}
     */
    static isController(Controller) {
        return !!(!util.isUndefined(Controller)
            && Controller.hasOwnProperty('isController')
            && Controller.hasOwnProperty('getControllerConfig')
            && Controller.isController);
    }

    //endregion

    //region PUBLIC METHODS
    /**
     * @param {Object} [options={}]
     * @param {String} options.path
     * @param {String} [options.prefix]
     * @param {Array.<String>} [options.ignoreFiles]
     * @param {Array.<String>} [options.justFiles]
     * @param {Function} [options.validator]
     * @param {Function} [options.sender]
     *
     * @returns {ControllerRegister}
     */
    init(options) {
        options = _.defaults(options, {
            path: '/controllers',
            validator: validatorInternal,
            sender: senderInternal
        });
        let controllers = _.chain(fs.readdirSync(options.path))
            .filter(file => ignoreFiles(options.ignoreFiles, file))
            .filter(file => justFiles(options.justFiles, file))
            .map(file => wrapFileNameToController(options, file))
            .value();
        registerEach.call(this, options, controllers);
        return this;
    }

    /**
     * @param {Object} [options={}]
     * @param {String} options.path
     * @param {String} [options.prefix]
     * @param {Array.<String>} [options.ignoreFiles]
     * @param {Array.<String>} [options.justFiles]
     * @param {Function} [options.validator]
     *
     * @returns {Promise.<ControllerRegister>}
     */
    initAsync(options) {
        let $this = this;
        options = _.defaults(options, {
            path: '/controllers',
            validator: validatorInternal,
            sender: senderInternal
        });
        return fsPromises.readdir(options.path)
            .then(files => _.chain(files)
                .filter(file => ignoreFiles(options.ignoreFiles, file))
                .filter(file => justFiles(options.justFiles, file))
                .map(file => wrapFileNameToController(options, file))
                .value())
            .then(controllers => {
                registerEach.call($this, options, controllers);
                return $this;
            });
    }
    //endregion

}

//region PRIVATE METHODS
function senderInternal(value, req, res, next) {
    let status = value.status || 200;
    let message = util.isFunction(value.toJSON) ? value.toJSON() : value.message;
    res = res.status(status);
    if (util.isUndefined(message)) {
        return res.end();
    } else {
        return res.json(message);
    }
}

function validatorInternal(value, schema, req) {
    return true;
}

/**
 * @private
 * @param {Object} options
 * @param {String} ControllerName
 * @returns {any}
 *
 * @method ControllerRegister
 * */
function wrapFileNameToController(options, ControllerName) {
    let Controller = require(options.path + '/' + ControllerName);
    if (util.isFunction(Controller.default)) Controller = Controller.default;
    if (!ControllerRegister.isController(Controller)) return;
    let restControllerConfig = Controller.getControllerConfig();

    let controller;
    if (!restControllerConfig.staticMode) {
        controller = new Controller();
    } else {
        controller = Controller;
    }
    return controller;
}

/**
 * @private
 * @param {Object} options
 * @param {any} controller
 *
 * @method ControllerRegister
 * */
function registerEach(options, controller) {
    if (!controller) return;
    register(this, options.prefix, controller, {
        validController: false,
        validator: options.validator,
        sender: options.sender
    });
}

/**
 * @private
 * @param {Array.<String>} [files=[]]
 * @param {String} [key=""]
 *
 * @returns {Boolean}
 * */
function justFiles(files = [], key = "") {
    if (!files || files.length == 0) return true;
    return !!(files.find(item => {
        if (!item) return false;
        if (item == key) return true;
        let itemIndex = item.lastIndexOf(".");
        item = item.slice(0, itemIndex == -1 ? item.length : itemIndex);
        let keyIndex = key.lastIndexOf(".");
        let keyAux = key.slice(0, keyIndex == -1 ? key.length : keyIndex);
        return item == keyAux;
    }));
}

/**
 * @private
 * @param {Array.<String>} [files=[]]
 * @param {String} [key=""]
 *
 * @returns {Boolean}
 * */
function ignoreFiles(files = [], key = "") {
    if (!files || files.length == 0) return true;
    return !justFiles(files, key);
}

/**
 * @private
 * @param {ControllerRegister} instance
 * @param {String} prefix
 * */
function hasPrefixRouter(instance, prefix) {
    if (!util.isObject(instance.subRouters)) instance.subRouters = {};
    return !util.isUndefined(instance.subRouters[prefix]);
}

/**
 * @private
 * @param {ControllerRegister} instance
 * @param {String} prefix
 * */
function addPrefixRouter(instance, prefix) {
    if (!util.isObject(instance.subRouters)) instance.subRouters = {};
    if (!hasPrefixRouter(instance, prefix)) instance.subRouters[prefix] = express.Router({mergeParams: true});
}

/**
 * @private
 * @param {ControllerRegister} instance
 * @param {String} prefix
 * @returns {Function}
 * */
function getPrefixRouter(instance, prefix) {
    if (!util.isObject(instance.subRouters)) instance.subRouters = {};
    return instance.subRouters[prefix];
}

/**
 * @param {ControllerRegister} instance
 * @param {String} [prefix]
 * @param {Array|Function|Object} Controllers
 * @param {Object} [options = {validController: true}]
 * @param {Boolean} [options.validController]
 * @param {Function} [options.validator]
 * @param {Function} [options.sender]
 * @returns {undefined}
 */
function register(instance, prefix, Controllers, options?) {
    if (!options) options = {validController: true};
    let hasPrefix;
    let router;
    if (util.isString(prefix) && prefix !== "") {
        if (!hasPrefixRouter(instance, prefix)) {
            addPrefixRouter(instance, prefix);
            router = getPrefixRouter(instance, prefix);
            instance.router.use(prefix, router);
        }
        if (!router) router = getPrefixRouter(instance, prefix);
        hasPrefix = true;
    } else if (!util.isUndefined(prefix)) {
        Controllers = prefix;
        prefix = null;
    }
    router = hasPrefix ? router : instance.router;

    function registerInternalAux(controller) {
        if (options.validController && !(ControllerRegister.isController(controller) && !controller.isConfigurated)) return;
        let config = controller.getControllerConfig();
        if (util.isFunction(options.validator)) {
            config.validator = options.validator;
        }
        if (util.isFunction(options.sender)) {
            config.sender = options.sender;
        }
        router.use(controller.getRouter());
    }

    if (!util.isArray(Controllers)) {
        registerInternalAux(Controllers);
    } else {
        for (let controller of Controllers) {
            registerInternalAux(controller);
        }
    }
}

//endregion