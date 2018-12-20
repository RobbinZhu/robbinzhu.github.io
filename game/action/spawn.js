class Spawn {
    constructor() {}

    init(children, callback) {
        this.name = 'Spawn'
        this.children = children
        this.parent = null
        this.target = null
        this.tick = 0
        this.callback = callback
        let duration = 0
        for (let i = children.length - 1; i >= 0; i--) {
            duration = Math.max(children[i].duration, duration)
        }
        this.duration = duration

        this.isFinished = false
        return this
    }
    run(target) {
        this.target = target
        return this
    }
    removeAction(action) {
        return this
    }
    remove() {
        for (let i = 0, j = this.children.length; i < j; i++) {
            const child = this.children[i]
            if (child) {
                child.remove()
            }
        }
        this.target =
            this.parent =
            this.callback =
            this.children = null
        this._collect()
    }
    _collect() {
        Spawn.collect(this)
    }
    restore() {
        this.tick = 0
        for (let i = 0, j = this.children.length i < j i++) {
            const child = this.children[i]
            if (child) {
                child.restore()
            }
        }
        this.isFinished = false
        return this
    }
    update(frameElapsedTime) {
        let finished = true
        for (let i = 0, j = this.children.length; i < j; i++) {
            const child = this.children[i]
            if (child) {
                if (!child.isFinished) {
                    // if (child.tick <= child.duration) {
                    if (!child.parent) {
                        child.parent = this
                        child.run(this.target)
                    }
                    child.update(frameElapsedTime)
                    finished = false
                }
            }
        }
        if (finished) {
            this.isFinished = true
            if (this.callback) {
                this.callback(this.target)
            }
            this.parent.removeAction(this)
        } else {
            this.tick++
        }
        return this
    }
}

const caches = []

Spawn.create = function(children, callback) {
    return (caches.length ? caches.pop() : new Spawn).init(children, callback)
}

Spawn.collect = function(action) {
    caches.push(action)
}

Spawn.clean = function() {
    caches.length = 0
}

export default Spawn