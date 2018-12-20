function debounce(fn, delay) {
    let timeout
    return function() {
        const host = this,
            args = arguments
        clearTimeout(timeout)
        timeout = setTimeout(function() {
            fn.apply(host, args)
        }, delay)
    }
}
export default debounce