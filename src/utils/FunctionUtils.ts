'use strict';

import * as util from "util";


export default class FunctionUtils {

    //region STATIC METHODS
    /**
     * @static
     * @param {String} name
     * @param {Function|*} [context]
     * @param {Function} fn
     * @returns {Function}
     * */
    static wrapName(name : String, context : any | Function, fn? : Function) : Function {
        if(!util.isFunction(fn) && util.isFunction(context)){
            fn = context;
            context = undefined;
        }
        let argsCount = fn.length;
        let argsText;
        if (argsCount > 0) {
            argsText = new Array(argsCount);
            for (let i = 0; i < argsCount;) {
                argsText[i] = ++i;
            }
            argsText = "_arg" + argsText.join(", _arg");
        } else argsText = "";
        return (eval("(function(fn, context){return function " + name + "(" + argsText + "){" +
                "\nreturn fn.apply(context || this, arguments);\n" +
            "}})"))(fn, context);
    }
    //endregion

}