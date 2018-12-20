class MouseEvent {
    constructor() {}

    init(x, y, type) {
        this.px = x
        this.py = y
        this.type = type
        return this
    }

    remove() {
        MouseEvent.collect(this)
    }
}

const caches = []

MouseEvent.create = function(x, y, type) {
    return (caches.length ? caches.pop() : new MouseEvent).init(x, y, type)
}

MouseEvent.collect = function(e) {
    caches.push(e)
}

MouseEvent.clean = function(e) {
    caches.length = 0
}
export default MouseEvent