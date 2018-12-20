import DataListener from './data_listener.js'
import compile from './compile.js'

let __id__ = 0

class MVVM{
    constructor() {}
    init(options) {
        Object.assign(this, options.data())
        DataListener.listen(this)

        this.el = options.el
        this._components = options.components || {}
        this.__id__ = ++__id__
        Object.assign(this, options.methods)
        compile(options.template || (this.el && this.el.innerHTML) || '', this, this.el)
        return this
    }
    getComponent(tagName) {
        return this._components[tagName.toLowerCase()] || MVVM.getComponent(tagName.toLowerCase())
    }
    isComponent(tagName) {
        return !!(this._components[tagName.toLowerCase()] || MVVM.getComponent(tagName.toLowerCase()))
    }
    initComponent(...args) {
        return MVVM.initComponent(...args)
    }
    static create(options) {
        return new MVVM().init(options)
    }
    static component() {}
    static getComponent() {}
    static initComponent() {}
    static create(options) {
        return new MVVM().init(options)
    }
}

export default MVVM