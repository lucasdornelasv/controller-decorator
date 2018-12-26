'use strict';

import RequestMapping from "./RequestMapping";


export default function BodyExpected(bodyExpected, options){
    return RequestMapping({bodyExpected: bodyExpected}, options);
}