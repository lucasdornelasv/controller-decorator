'use strict';

import RequestMapping from "./RequestMapping";


export default function Middleware(middlewares : Array<Function> | Function, options?) : Function {
    return RequestMapping({middlewares: middlewares}, options);
}