/*
function Queue() {
    const queue = []
    return {
        queue: function(fn) {
            queue.push(fn)
        },
        all: queue,
        remove: function() {
            queue = null
        },
        enqueue: function(fn) {
            queue.shift()
        }
    }
}*/
class Queue {
    constructor() {}
    init() {
        this._queue = []
        return this
    }
    queue(fn) {
        this._queue.push(fn)
    }
    enqueue() {
        this._queue.shift()
    }
    remove() {
        this._queue = null
    }
}
const cache = []
Queue.create = function() {
    return (cache.length ? cache.pop() : new Queue).init()
}
export default Queue