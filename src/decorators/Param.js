'use strict';

import RequestMapping from "./RequestMapping";
import * as util from "util";


export default function Param(param, fn, options){
    if(!options && fn && util.isObject(fn) && !util.isArray(fn) && (fn.targetMethods || fn.excludeMethods)
        && util.isArray(param)){
        options = fn;
        fn = undefined;
    }
    if(!util.isUndefined(fn)){
        param = [param, fn];
    }
    return RequestMapping({params: param}, options);
}