import Pubsub from '../common/pubsub.js'
class PubsubComponent {
    constructor() {}
    init(host) {
        this.host = host
        return this
    }
    pub() {
        Pubsub.pub.apply(null, arguments)
        return this
    }
    on(key, fn) {
        Pubsub.on(this.host, key, fn)
        return this
    }
    off(key, fn) {
        Pubsub.off(this.host, key, fn)
        return this
    }
    remove() {
        this.off()
        this.host = null
        PubsubComponent.collect(this)
    }
}

const caches = []
PubsubComponent.create = function(host) {
    return (caches.length ? caches.pop() : new PubsubComponent).init(host)
}
PubsubComponent.collect = function(component) {
    caches.push(component)
}
PubsubComponent.clean = function() {
    caches.length = 0
}

export default PubsubComponent