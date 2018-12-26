'use strict';

import BaseResponse from "./BaseResponse";
import HttpCode from "../HttpCode";


export default class CreateResponse extends BaseResponse {

    //region CONSTRUCTOR
    /**
     * @constructor
     * @param {*} entity
     * */
    constructor(entity) {
        super(HttpCode.CREATED, entity);
    }

    //endregion

    //region OVERRIDE METHODS
    /**
     * @override
     * @returns {any|Object}
     * */
    toJSON() : any {
        let value = super.toJSON();
        return {status: 'success', message: "__('response.create.return')", model: value};
    }

    //endregion

}