import GridWorldComponent from './grid_world_component.js'
class PhysicsWorldComponent {
    constructor() {}
    init() {
        this.gridWorldComponent = null
        this.tileComponent = null
        return this
    }
    setTile(tile) {
        this.tileComponent = tile
    }
    addGridWorldSupport(width, height, gridWidth, gridHeight) {
        this.gridWorldComponent || (this.gridWorldComponent = GridWorldComponent.create(width, height, gridWidth, gridHeight))
    }
    addNode(node) {
        node.addPhysicsSupport()
        this.gridWorldComponent && this.gridWorldComponent.addNode(node)
    }
    update(session, camera) {
        this.gridWorldComponent && this.gridWorldComponent.update(session, camera)
        this.handleCollision(session, camera)
        this.gridWorldComponent && this.gridWorldComponent.updateSpace(session, camera)
    }
    handleCollision(session, camera) {
        if (!camera) {
            return
        }
        // this.gridWorldComponent && this.gridWorldComponent.collide(camera)
        this.tileComponent && this.tileComponent.handleCollision(camera.frame, this.gridWorldComponent)
        this.gridWorldComponent && this.gridWorldComponent.update(session, camera)
    }
    render(session, camera) {
        this.tileComponent && this.tileComponent.render(session, camera)
    }
    removeChild(child) {
        child.remove()
    }
    remove() {
        this.gridWorldComponent && this.gridWorldComponent.remove()
        this.tileComponent && this.tileComponent.remove()
        this.tileComponent = this.gridWorldComponent = null
        PhysicsWorldComponent.collect(this)
    }
}

const caches = []
PhysicsWorldComponent.create = function() {
    return (caches.length ? caches.pop() : new PhysicsWorldComponent).init()
}
PhysicsWorldComponent.collect = function(component) {
    caches.push(component)
}
PhysicsWorldComponent.clean = function() {
    caches.length = 0
}
export default PhysicsWorldComponent