import Vector from '../../common/vector.js'
import InputState from './input_state.js'

import StateBaseComponent from './state_base.js'
import CollisionType from './collision_type.js'

class BulletStateComponent extends StateBaseComponent {
    constructor() {
        super()
    }
    init(host, face) {
        super.init(host)
        this.life = 100
        this.categoryBits = CollisionType.Bullet.categoryBits
        this.addCollisionTo(CollisionType.Monster)
        this.velocity.update(face > 0 ? 15 : -15, 0)
        return this
    }
    update(session) {}
    handle(resolveX, vx, resolveY, vy) {
        if (this.life-- < 0 || resolveX || resolveY) {
            this.host.nodeTreeComponent.removeFromParent()
        }
    }
    integration() {
        this.host.spaceComponent && this.host.spaceComponent.position.add(this.velocity)
    }
    remove() {
        super.remove()
        BulletStateComponent.collect(this)
    }
}

const caches = []
BulletStateComponent.create = function(host, face) {
    return (caches.length ? caches.pop() : new BulletStateComponent).init(host, face)
}
BulletStateComponent.collect = function(component) {
    caches.push(component)
}
BulletStateComponent.clean = function() {
    caches.length = 0
}

export default BulletStateComponent