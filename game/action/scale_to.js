class ScaleTo {
    constructor() {}

    init(toX, toY, duration, ease, callback) {
        this.name = 'ScaleTo'
        this.fromX = 0
        this.fromY = 0
        this.toX = toX
        this.toY = toY
        this.deltaX = 0
        this.deltaY = 0
        this.duration = duration
        this.iDuration = duration != 0 ? 1 / duration : 0
        this.callback = callback
        this.target = null
        this.parent = null
        this.fn = null
        this.tick = 0
        this.isFinished = false
        return this
    }
    initWithFn(fn, duration, ease, callback) {
        this.init(null, null, duration, ease, callback)
        this.fn = fn
        return this
    }
    run(target) {
        if (this.fn) {
            this.fn(target)
        }
        this.target = target
        this.fromX = target.scale.x
        this.fromY = target.scale.y
        this.deltaX = this.toX - this.fromX
        this.deltaY = this.toY - this.fromY
        return this
    }
    updateFrame(percent) {
        this.target.scale.update(
            this.deltaX * percent + this.fromX,
            this.deltaY * percent + this.fromY
        )
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
        ScaleTo.collect(this)
    }
}

const caches = []

ScaleTo.create = function(toX, toY, duration, ease, callback) {
    return (caches.length ? caches.pop() : new ScaleTo).init(toX, toY, duration, ease, callback)
}

ScaleTo.createWithFn = function(fn, duration, ease, callback) {
    return (caches.length ? caches.pop() : new ScaleTo).initWithFn(fn, duration, ease, callback)
}

ScaleTo.collect = function(action) {
    caches.push(action)
}

ScaleTo.clean = function() {
    caches.length = 0
}

export default ScaleTo