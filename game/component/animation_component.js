import ActionManager from '../action/action_manager.js'
class AnimationComponnet {
    constructor() {}
    init(host) {
        this.actionManager = ActionManager.create(host)
        return this
    }
    update(session) {
        this.actionManager.update(session)
    }
    remove() {
        this.actionManager.remove()
        this.actionManager = null
        AnimationComponnet.collect()
    }
}

const caches = []
AnimationComponnet.create = function(host) {
    return (caches.length ? caches.pop() : new AnimationComponnet).init(host)
}
AnimationComponnet.collect = function(component) {
    caches.push(component)
}
AnimationComponnet.clean = function() {
    caches.length = 0
}
export default AnimationComponnet