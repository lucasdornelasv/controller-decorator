'use strict';

import RequestMapping from "./RequestMapping";


export default function BodyExpected(bodyExpected : any, options? : any) : Function {
    return RequestMapping({bodyExpected: bodyExpected}, options);
}