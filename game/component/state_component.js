class StateComponent {
    constructor() {}
    init() {
        return this
    }
}

const caches = []
StateComponent.create = function(host) {
    return (caches.length ? caches.pop() : new StateComponent).init(host)
}
StateComponent.collect = function(component) {
    caches.push(component)
}
StateComponent.clean = function() {
    caches.length = 0
}
export default StateComponent