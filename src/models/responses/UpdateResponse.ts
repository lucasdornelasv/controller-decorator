'use strict';

import BaseResponse from "./BaseResponse";
import HttpCode from "../HttpCode";


export default class UpdateResponse extends BaseResponse {

    //region CONSTRUCTOR
    /**
     * @constructor
     * @param {*} entity
     * */
    constructor(entity) {
        super(HttpCode.OK, entity);
    }

    //endregion

    //region OVERRIDE METHODS
    /**
     * @override
     * @returns {any|Object}
     * */
    toJSON() {
        let entity = super.toJSON();
        return {status: 'success', message: "__('response.update.return')", model: entity};
    }

    //endregion

}