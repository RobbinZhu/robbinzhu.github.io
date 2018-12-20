import ArrayProto from './array.js'
import Watcher from './watcher.js'

function define(data, key, listener) {
    // console.warn(data, key, listener.__id__)
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            return listener.getValue()
        },
        set: function(value) {
            listener.setValue(value)
        }
    })
}

function buildListener(data, existedListener) {
    if (data.__listener__) {
        return data.__listener__
    }
    const listener = existedListener || DataListener.create(data)

    if (!(!data || typeof data !== 'object')) {
        Object.defineProperty(data, '__listener__', {
            value: listener,
            enumerable: false,
            writable: true,
            configurable: true
        })
    }
    return listener
}

let id = 0
const cache = []

class DataListener {
    constructor() {}
    init(value) {

        this.__id__ = ++id
        this.value = value
        this.watcherList = []

        this.setValueQueue = []
        this.setValuePromise = null
            // console.log('create', this.__id__, value)
        return this
    }
    remove() {
        this.watcherList.forEach((watcher) => {
            watcher.removeListener(this)
        })
        this.value =

            this.watcherList =

            this.setValueQueue =
            this.setValuePromise = null
        DataListener.collect(this)
    }
    getValue() {
        this.addWatcher()
        return this.value
    }
    setValue(value) {
        this.setValueQueue.push(value)
        if (!this.setValuePromise) {
            this.setValuePromise = Promise.resolve().then(() => {
                if (this.setValueQueue.length) {
                    const value = this.setValueQueue.pop()
                    if (value !== this.value) {

                        //listen new value
                        buildListener(value, this)
                        DataListener.listen(value)

                        DataListener.unListen(this.value)

                        this.value = value

                        //notify watchers to update
                        this.notifyWatchers()
                    }
                    this.setValueQueue.length = 0
                }
                this.setValuePromise = null
            })
        }
    }
    addWatcher() {
        if (Watcher.globalWatcher && this.watcherList.indexOf(Watcher.globalWatcher) < 0) {
            this.watcherList.push(Watcher.globalWatcher)
        }
    }
    removeWatcher(watcher) {
        const index = this.watcherList.indexOf(watcher)
        if (index > -1) {
            this.watcherList.splice(index, 1)
        }
    }
    notifyWatchers() {
        this.watcherList && this.watcherList.forEach((watcher) => {
            watcher && watcher.update(this)
        })
    }
    removeItemsFromArray(result) {
        if (!result.length) {
            return
        }
        result.forEach(function(item) {
            DataListener.unListen(item, true)
        })
    }
    removeItemFromArray(item) {
        DataListener.unListen(item, true)
    }
    static listen(data) {
        if (!data || typeof data !== 'object') {
            return
        }
        const isArray = Array.isArray(data)
        if (isArray) {
            data.__proto__ = ArrayProto
            data.forEach(DataListener.listen)
        } else {
            Object.keys(data).forEach(function(key) {
                DataListener.listen(data[key])
                define(data, key, buildListener(data[key]))
            })
        }
    }
    static unListen(data, remove) {
        return;
        const isArray = Array.isArray(data)
        if (isArray) {
            data.__proto__ = Array.prototype
            data.forEach(function(child) {
                DataListener.unListen(child, true)
            })
        } else {
            Object.keys(data).forEach(function(key) {
                DataListener.unListen(data[key], true)
                delete data[key]
            })
        }
    }
    static getListenerWithData(data) {
        return data.__listener__
    }
    static create(value) {
        return (cache.length ? cache.pop() : new DataListener).init(value)
    }
    static collect(listener) {
        cache.push(listener)
    }
    static cleanCache() {
        cache.length = 0
    }
}
export default DataListener