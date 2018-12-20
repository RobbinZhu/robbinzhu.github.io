// import Promise from './promise.js'

function addEventHandler(dom, type, fn) {
    dom.addEventListener(type, fn, {
        passive: true
    })
}

function removeEventHandler(dom, type, fn) {
    dom.removeEventListener(type, fn, {
        passive: true
    })
}

function visibilityChange(callback) {
    if ('hidden' in document) {
        document.addEventListener('visibilitychange', function() {
            callback(document.hidden)
        }, false)
    } else if ('webkitHidden' in document) {
        document.addEventListener('webkitvisibilitychange', function() {
            callback(document.webkitHidden)
        }, false)
    } else if ('mozHidden' in document) {
        document.addEventListener('mozvisibilitychange', function() {
            callback(document.mozHidden)
        }, false)
    } else if ('msHidden' in document) {
        document.addEventListener('msvisibilitychange', function() {
            callback(document.msHidden)
        }, false)
    } else {
        return false
    }
    return true
}

function requestAnimFrame() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(fn) {
            return window.setTimeout(fn, 16.67)
        }
}

function cancelAnimFrame() {
    return window.cancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFram ||
        function(timeout) {
            window.clearTimeout(timeout)
        }
}

function cancelTimeRequest(tick) {
    return cancelAnimFrame(tick.timeRequest)
}

function setTimeRequest(callback, times) {
    if (times <= 0) {
        callback()
        return
    }
    let count = 0
    const tick = {
        timeRequest: requestAnimFrame(function fn() {
            if (++count == times) {
                callback()
                fn = null
                requestAnimFrame = null
                count = null
            } else {
                tick.timeRequest = requestAnimFrame(fn)
            }
        })
    }
    return tick
}

const readyStates = ['interactive', 'loaded', 'complete']
export default {
    domReady: new Promise(function(resolve, reject) {
        readyStates.indexOf(document.readyState) >= 0 ? resolve() : addEventHandler(document, 'DOMContentLoaded', resolve)
    }),
    visibilityChange: visibilityChange,
    requestAnimFrame: requestAnimFrame(),
    cancelAnimFrame: cancelAnimFrame(),
    cancelTimeRequest: cancelTimeRequest,
    setTimeRequest: setTimeRequest
}