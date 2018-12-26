'use strict';

import * as util from "util";

export default function Wrap(wrapperMethod : Function) : Function {
    return function WrapDecorator(target, key?, descriptor?) {
        let aux;
        if(util.isFunction(target) && util.isUndefined(key) && util.isUndefined(descriptor)){
            //Case class
            aux = wrapperMethod(target, target.name, 'class');
            if(!util.isUndefined(aux)) target = aux;
            return target
        }else if(util.isFunction(target) || (!util.isFunction(target) && util.isObject(target))){
            //Case function
            let oldMethod = descriptor.value;
            aux = wrapperMethod(oldMethod, key, 'function', target);
            if(!util.isUndefined(aux)) descriptor.value = aux;
            return descriptor;
        }
    }
}