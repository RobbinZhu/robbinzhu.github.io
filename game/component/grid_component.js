class GridComponent {
    constructor() {}
    init() {
        this.header = null
        return this
    }
    update(session, camera) {}
    updatePosition() {
        let node = this.header
        while (node) {
            node.updatePosition()
            node = node._next
        }
    }
    render(session, camera) {
        let node = this.header
        while (node) {
            node.render(session, camera)
            node = node._next
        }
    }
}

const caches = []
GridComponent.create = function() {
    return (caches.length ? caches.pop() : new GridComponent).init()
}
GridComponent.collect = function(gridComponent) {
    caches.push(gridComponent)
}
GridComponent.clean = function() {
    caches.length = 0
}

export default GridComponent