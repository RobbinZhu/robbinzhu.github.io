import MVVM from './mvvm.js'
import DataListener from './data_listener.js'
import compile from './compile.js'

const notAllowText = 'not allow to write from child'

function DataProxy(data) {
    if (typeof data != 'object') {
        return data
    }
    return new Proxy(data, {
        get: function(target, key) {
            return DataProxy(target[key])
        },
        set: function(target, key, value) {
            console.error(notAllowText, key, value)
            return true
        }
    })
}

const components = {}
const cache = []
let id = 0
class Component extends MVVM {
    constructor() {
        super()
    }
    init(node, parent, options) {
        Object.assign(this, options.data())
        DataListener.listen(this)
        if (Array.isArray(options.props)) {
            options.props.forEach((prop) => {
                Object.defineProperty(this, prop, {
                    get: function() {
                        return DataProxy(parent[prop])
                    },
                    set: function(value) {
                        console.error(notAllowText, prop, value)
                    }
                })
            })
        }

        this.el = node
        this.__id__ = ++id
        this._components = options.components || {}
        Object.assign(this, options.methods)
        compile(options.template || (this.el && this.el.innerHTML) || '', this, this.el, true)
        return this
    }
    remove() {

    }
    static create(node, parent, options) {
        return (cache.length ? cache.pop() : new Component).init(node, parent, options)
    }
    static collect(component) {
        cache.push(component)
    }
    static cleanCache() {
        cache.length = 0
    }
}

MVVM.component = function(name, options) {
    components[name.toLowerCase()] = options
}

MVVM.getComponent = function(name) {
    return components[name.toLowerCase()]
}

MVVM.initComponent = function(node, options, parent) {
    return Component.create(node, options, parent)
}

export default Component