'use strict';

import RequestMapping from "./RequestMapping";

export default function GET(routes : Array<String> | String) : Function {
    return RequestMapping({
        method: "get", routes: routes
    });
}