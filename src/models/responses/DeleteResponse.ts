'use strict';

import BaseResponse from "./BaseResponse";
import HttpCode from "../HttpCode";


export default class DeleteResponse extends BaseResponse {

    //region CONSTRUCTOR
    /**
     * @constructor
     * */
    constructor() {
        super(HttpCode.NO_CONTENT);
    }

    //endregion

    //region OVERRIDE METHODS
    /**
     * @override
     * @returns {any|Object}
     * */
    toJSON() {
        return {status: 'success', message: "__('response.delete.return')"};
    }

    //endregion

}