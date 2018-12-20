import Listener from './data_listener.js'
const ArrayProto = Object.create(Array.prototype)
const slice = Array.prototype.slice;

[
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
].forEach(function(name) {
    const method = Array.prototype[name]
    ArrayProto[name] = function() {
        const listener = Listener.getListenerWithData(this)
        const args = slice.call(arguments, 0)
        const result = method.apply(this, args)
        switch (name) {
            case 'pop':
            case 'shift':
                // listener.removeItemFromArray(result)
                break
            case 'push':
            case 'unshift':
                args.forEach(Listener.listen)
                break
            case 'splice':
                // listener.removeItemsFromArray(result)
                args.slice(2).forEach(Listener.listen)
                break
        }
        listener.notifyWatchers()
        return result
    }
})

export default ArrayProto