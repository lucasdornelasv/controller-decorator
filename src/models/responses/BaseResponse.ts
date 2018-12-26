'use strict';


export default class BaseResponse {
    //region FIELDS
    public status : Number;
    public value : any;
    //endregion

    //region CONSTRUCTOR
    /**
     * @constructor
     * @param {Number} statusCode
     * @param {*} [value]
     * */
    constructor(statusCode : Number, value? : any) {
        this.status = statusCode;
        this.value = value;
    }

    //endregion

    //region PUBLIC METHODS
    /**
     * @returns {any}
     * */
    toJSON() : any {
        return this.value;
    }

    //endregion
}