'use strict';

import RequestMapping from "./RequestMapping";


export default function PATCH(routes : Array<String> | String) : Function {
    return RequestMapping({
        method: "patch", routes: routes
    });
}