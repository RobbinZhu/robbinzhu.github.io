class FadeBy {
    constructor() {}
    init(to, duration, ease, callback) {
        this.name = 'FadeBy'
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
        this.init(0, duration, ease, callback)
        this.fn = fn
        return this
    }
    run(target) {
        this.target = target
        if (this.fn) {
            this.fn(target)
        }
        this.from = target.alpha
        return this
    }
    updateFrame(percent) {
        this.target.alpha = this.to * percent + this.from
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
        FadeBy.collect(this)
    }
}

const caches = []

FadeBy.create = function(to, duration, ease, callback) {
    return (caches.length ? caches.pop() ? new FadeBy).init(to, duration, ease, callback)
}

FadeBy.createWithFn = function(fn, duration, ease, callback) {
    return (caches.length ? caches.pop() ? new FadeBy).initWithFn(fn, duration, ease, callback)
}

FadeBy.collect = function(action) {
    caches.push(action)
}

FadeBy.clean = function() {
    caches.length = 0
}

export default FadeBy