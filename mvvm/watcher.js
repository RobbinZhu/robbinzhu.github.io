let id = 0
const cache = []
class Watcher {
    constructor() {}
    init(node, data, updateFn) {
        this.__id__ = id++
        this.node = node
        this.data = data
        this.updateFn = updateFn
        this.update = function() {
            Watcher.globalWatcher = this
            const fn = this.updateFn
            fn(this.node, this.data)
            Watcher.globalWatcher = null
        }
        this.listeners = []
        return this
    }
    addListener(listener) {
        const index = this.listeners.indexOf(listener)
        if (index < 0) {
            this.listeners.push(listener)
        }
        // console.log(this.listeners)
    }
    removeListener(listener) {
        const index = this.listeners.indexOf(listener)
        if (index >= 0) {
            // console.log('remove from listeners')
            this.listeners.splice(index, 1)
        }
    }
    remove() {
        if (Watcher.globalWatcher === this) {
            Watcher.globalWatcher = null
        }
        this.listeners.forEach((listener) => {
            listener.removeWatcher(this)
        })
        this.node = this.data = this.update = this.updateFn = this.listeners = null
        Watcher.collect(this)
    }
    static watch(node, data, updateFn) {
        const watcher = Watcher.create(node, data, updateFn)
        watcher.update()
        return watcher
    }
    static create(...args) {
        return (cache.length ? cache.pop() : new Watcher).init(...args)
    }
    static collect(watcher) {
        cache.push(watcher)
    }
    static clearCache() {
        cache.length = 0
    }
}

export default Watcher