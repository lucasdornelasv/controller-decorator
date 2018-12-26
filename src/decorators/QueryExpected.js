'use strict';

import RequestMapping from "./RequestMapping";


export default function QueryExpected(query, options){
    return RequestMapping({query: query}, options);
}