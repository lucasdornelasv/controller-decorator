'use strict';

import RequestMapping from "./RequestMapping";


export default function Interceptor(interceptors : Array<Function> | Function, options?) : Function {
    return RequestMapping({interceptors: interceptors}, options);
}