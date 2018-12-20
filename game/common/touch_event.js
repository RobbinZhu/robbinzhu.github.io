class TouchEvent {
    constructor() {}
    init(x, y, type, identifier) {
        this.x = x
        this.y = y
        this.identifier = identifier
        this.type = type
        return this
    }
    remove() {
        TouchEvent.collect(this)
    }
}

const caches = []

TouchEvent.create = function(x, y, type, identifier) {
    return (caches.length ? caches.pop() : new TouchEvent).init(x, y, type, identifier)
}

TouchEvent.collect = function(e) {
    caches.push(e)
}

TouchEvent.clean = function(e) {
    caches.length = 0
}

export default TouchEvent