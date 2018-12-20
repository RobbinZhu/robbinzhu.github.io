import Vector from '../common/vector.js'
import HookComponent from './hook_component.js'

class PhysicsComponent {
    constructor() {}
    init(host) {
        this.applyGravity = false
        this.gravityVelocity = Vector.create(0, 1)
        this.velocity = Vector.create(0, 0)
        this.velocityPrevious = Vector.create(0, 0)
        this.positionPrevious = Vector.create(0, 0)
        this.host = host
            /*
            this.touchLeft =
                this.touchRight =
                this.touchGround =
                this.touchTop = null
                */
        return this
    }
    handle(resolveX, vx, resolveY, vy) {
        /*
        this.touchLeft = resolveX && (vx < 0)
        this.touchRight = resolveX && (vx > 0)

        this.touchTop = resolveY && (vy < 0)
        this.touchGround = resolveY && (vy > 0)
        */
    }
    update(session) {
        if (!this.host.isActive) {
            return
        }
        this.velocityPrevious.set(this.velocity)
        if (this.applyGravity) {
            this.velocity.add(this.gravityVelocity)
        }
    }
    updateSpace() {
        const position = this.host.spaceComponent.position
        this.positionPrevious.set(position)
        position.add(this.velocity)
    }
    remove() {
        this.gravityVelocity.remove()
        this.velocity.remove()
        this.velocityPrevious.remove()
        this.positionPrevious.remove()
        this.gravityVelocity =
            this.velocity =
            this.velocityPrevious =
            this.positionPrevious =
            this.host = null
        PhysicsComponent.collect(this)
    }
}

const caches = []
PhysicsComponent.create = function(host) {
    return (caches.length ? caches.pop() : new PhysicsComponent).init(host)
}
PhysicsComponent.collect = function(component) {
    caches.push(component)
}
PhysicsComponent.clean = function() {
    caches.length = 0
}

export default PhysicsComponent