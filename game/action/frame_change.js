class FrameChange {
    constructor() {}
    init(frames, framesToChange, duration, callback) {
        this.name = 'FrameChange'
        this.parent = null
        this.target = null
        this.tick = 0
        this.frameTotal = frames.length
        this.frames = frames
        this.currentFrameIndex = 0
        this.framesToChange = framesToChange
        this.tickFrame = 0
        this.duration = duration === undefined ? Infinity : duration
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
        if (this.tickFrame++ == this.framesToChange) {
            const frame = this.frames[++this.currentFrameIndex % this.frameTotal]
            this.target.graphicsComponent.texture.updateFrame(frame)
            this.tickFrame = 0
        }
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
        FrameChange.collect(this)
    }
}

const caches = []

FrameChange.create = function(frames, framesToChange, duration, callback) {
    return (caches.length ? caches.pop() : new FrameChange).init(frames, framesToChange, duration, callback)
}

FrameChange.createWithFn = function(fn, duration, callback) {
    return (caches.length ? caches.pop() : new FrameChange).initWithFn(fn, duration, callback)
}

FrameChange.collect = function(action) {
    caches.push(action)
}

FrameChange.clean = function() {
    caches.length = 0
}

export default FrameChange