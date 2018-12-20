class Sequence {
    constructor() {}

    init(children, callback) {
        this.name = 'Sequence'
        this.children = children
        this.parent = null
        this.target = null
        this.currentAction = null
        this.tick = 0
        this.callback = callback
        this.currentIndex = -1
        this.isFinished = false
        let duration = 0
        for (let i = children.length - 1; i >= 0; i--) {
            duration += children[i].duration
        }
        this.duration = duration
        return this
    }
    run(target) {
        this.target = target
        return this
    }
    removeAction(action) {
        if (this.currentAction === action) {
            this.currentAction = null
        }
        action.restore()
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
        Sequence.collect(this)
    }
    restore() {
        this.tick = 0
        this.currentIndex = -1
        this.isFinished = false
        return this
    }
    update(frameElapsedTime) {
        let action = this.currentAction
        if (!action) {
            const nextIndex = ++this.currentIndex
            if (nextIndex < this.children.length) {
                action = this.children[nextIndex]
                this.currentAction = action
                if (action) {
                    action.parent = this
                    action.run(this.target)
                }
            }
        }
        if (!action) {
            this.isFinished = true
            this.currentIndex = -1
            if (this.callback) {
                this.callback(this.target)
            }
            this.parent.removeAction(this)
        } else {
            action.update(frameElapsedTime)
            this.tick++
        }
        return this
    }
}

const caches = []

Sequence.create = function(children, callback) {
    return (caches.length ? caches.pop() : new Sequence).init(children, callback)
}

Sequence.collect = function(action) {
    caches.push(action)
}

Sequence.clean = function() {
    caches.length = 0
}

export default Sequence