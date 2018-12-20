import Vector from '../../common/vector.js'
import InputState from './input_state.js'
import TouchState from './touch_state.js'

import StateBaseComponent from './state_base.js'

import CollisionType from './collision_type.js'

class FrogStateComponent extends StateBaseComponent {
    constructor() {
        super()
    }
    init(host) {
        super.init(host)
        this.categoryBits = CollisionType.Monster.categoryBits
        this.addCollisionTo(CollisionType.Hero)
        this.addCollisionTo(CollisionType.Bullet)
        this.targetHero = null
        this.velocity.y = 10
        this.stateY = 0
        this.touchState = 0
        this.applyGravity = true
        this.gravity = Vector.create(0, 2)
        this.idleTime = 0
        return this
    }
    update(session) {
        if (!this.targetHero) {
            const siblings = this.host.nodeTreeComponent.parent.children
            for (let i = 0, j = siblings.length; i < j; i++) {
                if (siblings[i] && siblings[i].name == 'hero') {
                    this.targetHero = siblings[i]
                    break
                }
            }
        }

        if (!this.targetHero) {
            return
        }
        if (this.targetHero && !this.targetHero.isActive) {
            this.targetHero = null
            return
        }

        const node = this.host
        let scaleX = node.spaceComponent.scale.x

        let velocityX = this.velocity.x
        let velocityY = this.velocity.y

        const absX = Math.abs(velocityX)
        const absY = Math.abs(velocityY)
        const dirVx = velocityX >= 0 ? 1 : -1

        const touchGround = this.touchState & TouchState.touchGround
        const touchTop = this.touchState & TouchState.touchTop
        const touchLeft = this.touchState & TouchState.touchLeft
        const touchRight = this.touchState & TouchState.touchRight
        const touchWater = this.touchState & TouchState.touchWater

        if (this.applyGravity) {
            velocityY += this.gravity.y
        }
        switch (this.stateY) {
            case 0:
                if (++this.idleTime >= 180) {
                    this.stateY = 1
                    this.idleTime = 0
                }
                this.velocity.x *= 0.9
                break
            case 1:
                const delta = this.targetHero.spaceComponent.frame.x - this.host.spaceComponent.frame.x
                if (-500 <= delta && delta <= 500) {
                    if (touchGround) {
                        velocityY = -10
                        this.velocity.x = delta > 0 ? 10 : -10
                    }
                    this.host.spaceComponent.scale.x = delta > 0 ? 1 : -1
                    this.stateY = 0
                }
                break
        }
        this.velocity.y = velocityY //Math.min(50, Math.max(-50, velocityY))
    }
    handle(resolveX, vx, resolveY, vy) {
        // vy = Math.min(this.velocityMaxY, vy)
        let touchState = 0
        if (resolveX && (vx < 0)) {
            touchState += TouchState.touchLeft
        }
        if (resolveX && (vx > 0)) {
            touchState += TouchState.touchRight
        }
        if (resolveY && (vy < 0)) {
            touchState += TouchState.touchTop
        }
        if (resolveY && (vy > 0)) {
            touchState += TouchState.touchGround
        }
        this.touchState = touchState
    }
    integration() {
        this.host.spaceComponent && this.host.spaceComponent.position.add(this.velocity)
    }
    remove() {
        super.remove()
        this.targetHero = null
        FrogStateComponent.collect(this)
    }
}

const caches = []
FrogStateComponent.create = function(host) {
    return (caches.length ? caches.pop() : new FrogStateComponent).init(host)
}
FrogStateComponent.collect = function(component) {
    caches.push(component)
}
FrogStateComponent.clean = function() {
    caches.length = 0
}

export default FrogStateComponent