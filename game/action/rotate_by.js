class RotateBy {
    constructor() {}

    init(to, duration, ease, callback) {
        this.name = 'RotateBy'
        this.parent = null
        this.target = null
        this.from = 0
        this.to = to
        this.tick = 0
        this.duration = duration
        this.iDuration = duration != 0 ? 1 / duration : 0
        this.ease = ease
        this.callback = callback
        this.fn = null
        this.isFinished = false
        return this
    }
    initWithFn(fn, duration, ease, callback) {
        this.init(-1, duration, ease, callback)
        this.fn = fn
        return this
    }
    run(target) {
        this.target = target
        if (this.fn) {
            this.fn(target)
        }
        this.from = target.rotation.angle
        return this
    }
    updateFrame(percent) {
        this.target.rotation.update(this.to * percent + this.from)
        return this
    }
    update(frameElapsedTime) {
        this.tick += frameElapsedTime
        if (this.tick >= this.duration) {
            this.updateFrame(1)
            this.isFinished = true
            if (this.callback) {
                this.callback(this.target)
            }
            this.parent.removeAction(this)
        } else {
            this.updateFrame(this.tick * this.iDuration)
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
        RotateBy.collect(this)
    }
}

const caches = []

RotateBy.create = function(to, duration, ease, callback) {
    return (caches.length ? caches.pop() : new RotateBy).init(to, duration, ease, callback)
}

RotateBy.createWithFn = function(fn, duration, ease, callback) {
    return (caches.length ? caches.pop() : new RotateBy).initWithFn(fn, duration, ease, callback)
}

RotateBy.collect = function(action) {
    caches.push(action)
}

RotateBy.clean = function() {
    caches.length = 0
}

export default RotateBy