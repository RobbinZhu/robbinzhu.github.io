export default function throttle(fn, idle) {
    let time = 0
    return function() {
        const now = Date.now()
        if (now - time > idle) {
            const rtn = fn.apply(this, arguments)
            time = now
            return rtn
        }
    }
}