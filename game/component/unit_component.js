class UnitComponent {
    constructor() {}
    init(node) {
        this._prev = null
        this._next = null
        this.cellXIndex = 0
        this.cellYIndex = 0
        this.node = node
        this.world = null
        return this
    }
    setWorld(world) {
        this.world = world
    }
    update() {
        this.world.updateUnit(this)
    }
    updatePosition() {
        this.node.physicsComponent && this.node.physicsComponent.updateSpace()
    }
    remove() {
        this.world = this._prev = this._next = this.node = null
        UnitComponent.collect(this)
    }
    removeCascade() {
        let toRemove = this
        let next
        while (toRemove) {
            next = toRemove._next
            toRemove.remove()
            toRemove = next
        }
    }
}

const caches = []
UnitComponent.create = function(node) {
    return (caches.length ? caches.pop() : new UnitComponent).init(node)
}
UnitComponent.collect = function(unit) {
    caches.push(unit)
}
UnitComponent.clean = function() {
    caches.length = 0
}

export default UnitComponent