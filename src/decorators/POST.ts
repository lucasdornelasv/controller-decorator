'use strict';

import RequestMapping from "./RequestMapping";


export default function POST(routes : Array<String> | String) : Function {
    return RequestMapping({
        method: "post", routes: routes
    });
}