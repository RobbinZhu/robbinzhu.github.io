class Repeat {
    constructor() {}

    init(action, times, callback) {
        this.name = 'Repeat'
        this.action = action
        this.parent = null
        this.target = null
        this.callback = callback
        this.currentTime = 0
        this.times = times
        return this
    }
    run(target) {
        this.target = target
        return this
    }
    removeAction(action) {
        this.currentTime++
            action.restore()
        return this
    }
    remove() {
        const child = this.action
        if (child) {
            child.remove()
        }
        this.target =
            this.parent =
            this.callback =
            this.action = null
        this._collect()
    }
    _collect() {
        Repeat.collect(this)
    }
    restore() {
        this.tick = 0
        this.action.restore()
        this.currentTime = 0
        return this
    }
    update(frameElapsedTime) {
        if (this.currentTime < this.times) {
            const child = this.action
            if (child) {
                if (!child.isFinished) {
                    if (!child.parent) {
                        child.parent = this
                        child.run(this.target)
                    }
                    child.update(frameElapsedTime)
                } else {
                    child.restore()
                    this.currentTime++
                }
            }
        } else {
            this.isFinished = true
            if (this.callback) {
                this.callback(this.target)
            }
            this.parent.removeAction(this)
        }
        return this
    }
}

const caches = []

Repeat.create = function(action, times, callback) {
    return (caches.length ? caches.pop() : new Repeat).init(action, times, callback)
}

Repeat.collect = function(action) {
    caches.push(action)
}

Repeat.clean = function() {
    caches.length = 0
}

export default Repeat