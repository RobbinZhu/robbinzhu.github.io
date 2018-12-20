class ScaleBy {
    constructor() {}

    init(deltaX, deltaY, duration, ease, callback) {
        this.name = 'ScaleBy'
        this.fromX = 0
        this.fromY = 0
        this.deltaX = deltaX
        this.deltaY = deltaY
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
        this.init(0, 0, duration, ease, callback)
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
        return this
    }
    updateFrame(percent) {
        this.target.scale.x = this.deltaX * percent + this.fromX
        this.target.scale.y = this.deltaY * percent + this.fromY
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
        ScaleBy.collect(this)
    }
}

const caches = []

ScaleBy.create = function(deltaX, deltaY, duration, ease, callback) {

    return (caches.length ? caches.pop() : new ScaleBy).init(deltaX, deltaY, duration, ease, callback)
}

ScaleBy.createWithFn = function(fn, duration, ease, callback) {
    return (caches.length ? caches.pop() : new ScaleBy).initWithFn(fn, duration, ease, callback)
}

ScaleBy.collect = function(action) {
    caches.push(action)
}

ScaleBy.clean = function() {
    caches.length = 0
}

export default ScaleBy