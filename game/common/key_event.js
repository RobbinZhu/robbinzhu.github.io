class KeyEvent {
    constructor() {}
    init(code, type) {
        this.code = code
        this.type = type
        return this
    }
    remove() {
        this.code = null
        this.type = null
        KeyEvent.collect(this)
    }
}
const caches = []

KeyEvent.create = function(code, type) {
    return (caches.length ? caches.pop() : new KeyEvent).init(code, type)
}

KeyEvent.collect = function(e) {
    caches.push(e)
}

export default KeyEvent