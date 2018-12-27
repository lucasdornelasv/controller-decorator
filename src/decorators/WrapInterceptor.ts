'use strict';


export default function WrapInterceptor(target, key, descriptor) {
    if(descriptor) descriptor.value = wrapPromiseInterceptor(descriptor.value);
}

function wrapPromiseInterceptor(method) {
    let promise = async function () {
        let aux = method.apply(this, arguments);
        if (aux instanceof Promise) aux = await aux;
        return aux;
    };

    return function (result, req, res, next) {
        return promise
            .apply(this, arguments)
            .then(next)
            .catch(next);
    }
}