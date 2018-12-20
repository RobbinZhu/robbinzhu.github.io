class Delay {
    constructor() {}
    init(duration, callback) {
        this.name = 'Delay'
        this.parent = null
        this.target = null
        this.tick = 0
        this.duration = duration
        this.callback = callback
        this.fn = null
        this.isFinished = false
        return this
    }
    initWithFn(fn, callback) {
        this.init(-1, callback)
        this.fn = fn
        return this
    }
    run(target) {
        this.target = target
        if (this.fn) {
            this.fn(target)
        }
        return this
    }
    update(frameElapsedTime) {
        this.tick += frameElapsedTime
        // console.log('tick', this.tick)
        if (this.tick >= this.duration) {
            this.isFinished = true
            if (this.callback) {
                this.callback(this.target)
            }
            this.parent.removeAction(this)
        }
        return this
    }
    restore() {
        this.tick = 0
        this.isFinished = false
        return this
    }
    remove() {
        this.parent =
            this.target =
            this.callback =
            this.fn = null
        this._collect()
    }
    _collect() {
        Delay.collect(this)
    }
}

const caches = []

Delay.create = function(duration, ease, callback) {
    return (caches.length ? caches.pop() : new Delay).init(duration, ease, callback)
}

Delay.createWithFn = function(fn, duration, ease, callback) {
    return (caches.length ? caches.pop() : new Delay).initWithFn(fn, duration, ease, callback)
}

Delay.collect = function(action) {
    caches.push(action)
}

Delay.clean = function() {
    caches.length = 0
}

export default Delay