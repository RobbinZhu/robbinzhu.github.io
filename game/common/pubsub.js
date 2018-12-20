/*
obj = {
    'message1': [
        {
            host: Object1,
            fn: callback1
        },
        {
            host: Object2,
            fn: callback2
        },
        {
            host: null,
            fn: callback3
        }
    ],
    'message2': [
        {
            host: null,
            fn: callbackX
        }
    ]
}
*/
const obj = {},
    slice = Array.prototype.slice

function on(host, key, fn) {
    if (!obj[key]) {
        obj[key] = []
    }
    obj[key].push({
        host: host,
        fn: fn
    })
    return this
}

function off(host, key, fn) {
    if (key) {
        if (!obj[key]) {
            return this
        }
        const listeners = obj[key]
        if (fn) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const listener = listeners[i]
                if (listener.fn === fn) {
                    if (host === null || (listener.host === host)) {
                        obj[key].splice(i, 1)
                    }
                }
            }
            return this
        }

        for (let i = listeners.length - 1; i >= 0; i--) {
            const listener = listeners[i]
            if (host === null || listener.host === host) {
                obj[key].splice(i, 1)
            }
        }
        return this
    }
    const props = Object.keys(obj)
    const size = props.length
    for (let i = 0; i < size; i++) {
        const listeners = obj[props[i]]
        for (let j = listeners.length - 1; j >= 0; j--) {
            const listener = listeners[i]
            if (listener && listener.host === host) {
                listeners.splice(i, 1)
            }
        }
    }
    return this
}

function emit(key) {
    //console.log('pub ' + key + '\t' + arguments[1]);
    if (!obj[key]) {
        return
    }
    const arg = slice.call(arguments, 1)
    for (let i = 0, j = obj[key].length; i < j; i++) {
        const listener = obj[key][i]
        listener.fn.apply(listener.host, arg)
    }
    return this
}

function inspect() {
    return obj
}

export default {
    on: on,
    sub: on,
    off: off,
    unsub: off,
    emit: emit,
    pub: emit,
    inspect: inspect
}