import TouchEvent from './touch_event.js'
import KeyEvent from './key_event.js'
const inEjecta = typeof ejecta != 'undefined'

const eventTypes = {
    touchstart: 'touch',
    touchmove: 'touch',
    touchend: 'touch',
    touchcancel: 'touch',
    keydown: 'key',
    keypress: 'key',
    keyup: 'key'
}
const touchEventTypes = [
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel'
]
const keyEventTypes = [
    'keydown',
    'keypress',
    'keyup'
]


const passive = {
    passive: true
}

function resetTouchEvents() {
    for (let i = 0, j = touchEvents.length; i < j; i++) {
        if (touchEvents[i]) {
            touchEvents[i].remove()
        }
    }
    touchEvents.length = 0
}

function resetKeyEvents() {}

function reset() {
    // resetTouchEvents()
    // resetKeyEvents()
    return this
}

const touchEvents = []
const touchIdentifiers = {}
let keyEvents = {}

function removeIdentifier(identifier) {
    if (inEjecta) {
        delete touchIdentifiers[identifier]
    } else {
        touchIdentifiers[identifier] = null
    }
}

const keyEventCodes = []
const util = {
    touch: function(e, session) {
        const scaleRatio = session.display.scaleRatio
        const matrix = session.getTransform()
        for (let i = 0, j = e.changedTouches.length; i < j; i++) {
            const touch = e.changedTouches[i]
            const identifier = touch.identifier
            const touchEvent = TouchEvent.create(
                    matrix.a * touch.clientX * scaleRatio + matrix.e,
                    matrix.d * touch.clientY * scaleRatio + matrix.f,
                    e.type,
                    identifier
                )
                // console.log(touchEvent.x, touchEvent.y)
            switch (e.type) {
                case 'touchstart':
                    // console.log('set identifier touchstart')
                    touchIdentifiers[identifier] = touchEvent
                    const totalEvents = touchEvents.length
                    let i = 0
                    while (i < totalEvents) {
                        if (touchEvents[i] == null) {
                            touchEvents[i] = touchEvent
                            break
                        }
                        i++
                    }
                    if (i == totalEvents) {
                        touchEvents.push(touchEvent)
                    }
                    break
                case 'touchmove':
                    if (touchIdentifiers[identifier]) {
                        const index = touchEvents.indexOf(touchIdentifiers[identifier])
                        if (index > -1) {
                            touchEvents[index].remove()
                            touchEvents[index] = touchEvent
                        }
                        // console.log('set identifier touchmove')
                        touchIdentifiers[identifier] = touchEvent
                    }
                    break
                case 'touchend':
                case 'touchcancel':
                    if (touchIdentifiers[identifier]) {
                        const index = touchEvents.indexOf(touchIdentifiers[identifier])
                        if (index > -1) {
                            touchEvents[index].remove()
                            touchEvents[index] = null
                        }
                        removeIdentifier(identifier)
                    }
                    break
                default:
                    break
            }
        }
    },
    key: function(e, session) {
        const code = e.which || e.keyCode
        if (keyEvents[code] === undefined) {
            return
        }
        const type = e.type
        switch (type) {
            case 'keydown':
                if (!keyEvents[code]) {
                    keyEvents[code] = KeyEvent.create(code, e.type)
                }
                break
            case 'keyup':
                if (keyEvents[code]) {
                    keyEvents[code].remove()
                    keyEvents[code] = null
                }
                break
            case 'keypress':
                break
        }
    }
}

function listen(dom, typeArray, handler) {
    for (let i = typeArray.length - 1; i >= 0; i--) {
        dom.addEventListener(typeArray[i], handler, passive)
    }
}

function unListen(dom, typeArray, handler) {
    for (let i = typeArray.length - 1; i >= 0; i--) {
        dom.removeEventListener(typeArray[i], handler, passive)
    }
}
class DomEvent {
    constructor() {}
    init(dom, session) {
        this.session = session
        this.filter = this.filter.bind(this)
        this.dom = dom
        return this
    }
    listenTouchEvents() {
        this.stopListenTouchEvents()
        listen(this.dom, touchEventTypes, this.filter)
        return this
    }
    listenKeyEvents(keys) {
        keyEventCodes.length = 0
        keyEvents = {}
        keys.forEach(function(key) {
            keyEventCodes.push(key)
            keyEvents[key] = null
        })
        this.stopListenKeyEvents()
        listen(this.dom, keyEventTypes, this.filter)
        return this
    }
    stopListen() {
        return this.stopListenKeyEvents()
            .stopListenTouchEvents()
    }
    stopListenTouchEvents() {
        unListen(this.dom, touchEventTypes, this.filter)
        return this
    }
    stopListenKeyEvents() {
        unListen(this.dom, keyEventTypes, this.filter)
        return this
    }
    remove() {
        this.resetTouchEvents()
        this.resetKeyEvents()
        this.stopListen()
        this.filter = null
        this.dom = null
        this.session = null
    }
    filter(e) {
        util[eventTypes[e.type]](e, this.session)
    }
    getKeyEvents() {
        return keyEvents
    }
    getTouchEvents() {
        let allEmpty = true
        for (let total = touchEvents.length - 1; total >= 0; total--) {
            if (touchEvents[total]) {
                allEmpty = false
                break
            }
        }
        if (allEmpty) {
            touchEvents.length = 0
        }
        return touchEvents
    }
}

DomEvent.prototype.resetTouchEvents = resetTouchEvents
DomEvent.prototype.resetKeyEvents = resetKeyEvents
DomEvent.prototype.reset = reset

const cache = []
DomEvent.create = function(dom, session) {
    return (cache.length ? cache.pop() : new DomEvent).init(dom, session)
}
DomEvent.collect = function(domEvent) {
    cache.push(domEvent)
}

DomEvent.clean = function() {
    cache.length = 0
}

export default DomEvent