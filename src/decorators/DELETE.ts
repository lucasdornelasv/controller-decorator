'use strict';

import RequestMapping from "./RequestMapping";


export default function DELETE(routes : Array<String> | String) : Function {
    return RequestMapping({
        method: "delete", routes: routes
    });
}