'use strict';

import RequestMapping from "./RequestMapping";


export default function QueryExpected(query : any, options?) : Function {
    return RequestMapping({query: query}, options);
}