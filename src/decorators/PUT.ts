'use strict';

import RequestMapping from "./RequestMapping";


export default function PUT(routes : Array<String> | String) : Function {
    return RequestMapping({
        method: "put", routes: routes
    });
}