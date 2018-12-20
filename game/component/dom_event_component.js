import TouchEvent from '../common/touch_event.js'
import KeyEvent from '../common/key_event.js'
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

// const keyEventCodes = []
const util = {
    touch: function(e, wrap) {
        const session = wrap.session
        const touchEvents = wrap.touchEvents
        const touchIdentifiers = wrap.touchIdentifiers
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
                        wrap.removeIdentifier(identifier)
                    }
                    break
                default:
                    break
            }
        }

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
        // console.log(touchEvents)
    },
    key: function(e, wrap) {
        const session = wrap.session
        const keyEvents = wrap.keyEvents
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

class DomEventComponent {
    constructor() {}
    init(dom, session) {
        this.session = session
        this.dom = dom
        this.touchEvents = []
        this.keyEvents = {}
        this.touchIdentifiers = {}
        this.filter = this.filter.bind(this)
        return this
    }
    listenTouchEvents() {
        this.stopListenTouchEvents()
        listen(this.dom, touchEventTypes, this.filter)
        return this
    }
    listenKeyEvents(keys) {
        // keyEventCodes.length = 0
        const keyEvents = this.keyEvents
        keys.forEach(function(key) {
            // keyEventCodes.push(key)
            keyEvents[key] = null
        })
        this.stopListenKeyEvents()
        listen(this.dom, keyEventTypes, this.filter)
        return this
    }
    stopListen() {
        return this.stopListenKeyEvents().stopListenTouchEvents()
    }
    stopListenTouchEvents() {
        unListen(this.dom, touchEventTypes, this.filter)
        return this
    }
    stopListenKeyEvents() {
        unListen(this.dom, keyEventTypes, this.filter)
        return this
    }
    filter(e) {
        util[eventTypes[e.type]](e, this)
    }
    resetTouchEvents() {
        const touchEvents = this.touchEvents
        for (let i = 0, j = touchEvents.length; i < j; i++) {
            if (touchEvents[i]) {
                touchEvents[i].remove()
            }
        }
        touchEvents.length = 0
    }
    resetKeyEvents() {

    }
    removeIdentifier(identifier) {
        if (inEjecta) {
            delete this.touchIdentifiers[identifier]
        } else {
            this.touchIdentifiers[identifier] = null
        }
    }
    reset() {}
    remove() {
        this.resetTouchEvents()
        this.resetKeyEvents()
        this.stopListen()
        this.filter =
            this.dom =
            this.session =
            this.touchEvents =
            this.keyEvents =
            this.touchIdentifiers = null
        DomEventComponent.collect(this)
    }
}

const cache = []
DomEventComponent.create = function(dom, session) {
    return (cache.length ? cache.pop() : new DomEventComponent).init(dom, session)
}
DomEventComponent.collect = function(domEventComponent) {
    cache.push(domEventComponent)
}

DomEventComponent.clean = function() {
    cache.length = 0
}

export default DomEventComponent