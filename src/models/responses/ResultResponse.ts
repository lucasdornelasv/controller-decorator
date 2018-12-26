'use strict';

import BaseResponse from "./BaseResponse";
import HttpCode from "../HttpCode";


export default class ResultResponse extends BaseResponse {

    //region CONSTRUCTOR
    /**
     * @constructor
     * @param {*} entity
     * */
    constructor(entity) {
        super(HttpCode.OK, entity);
    }

    //endregion

}