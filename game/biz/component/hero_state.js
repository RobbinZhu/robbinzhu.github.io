import Vector from '../../common/vector.js'
import TouchState from './touch_state.js'
import InputState from './input_state.js'

import StateBaseComponent from './state_base.js'

import FrameChange from '../../action/frame_change.js'
import CollisionType from './collision_type.js'
import heroPlistText from './hero_plist.js'
import TextureFrame from '../../common/texture_frame.js'
class HeroStateComponent extends StateBaseComponent {
    constructor() {
        super()
    }
    init(host) {
        super.init(host)
        this.categoryBits = CollisionType.Hero.categoryBits
        this.addCollisionTo(CollisionType.Monster)

        this.canJump = true

        this.jumps = [{
            holdNumber: 0,
            frameNumberThreshold: 10,
            frameNumber: 0,
            velocities: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -10, -8, -6, -6, -4, -4, -2, 0]
        }, {
            holdNumber: 0,
            frameNumberThreshold: 1000,
            frameNumber: 0,
            velocities: [-12, -12, -12, -12, -12, -12, -10, -10, -8, -8, -6, -6, -6, -6, 0, 0, 0, 0, 0, 0]
        }]
        this.currentJumpIndex = -1

        this.jumpAbility = 2

        this.canMove = true

        this.velocityMoveX = 10
        this.velocitySwimX = 6
        this.velocityJumpX = 12
        this.velocityMaxY = 20

        // this.stateX = null
        this.stateY = 0
        this.touchState = 0

        this.prevInput = 0

        this.applyGravity = true
        this.gravity = Vector.create(0, 1)
        this.host.addAnimationSupport()
        const frames = TextureFrame.create(heroPlistText).frames
        const animationFrames = Object.keys(frames).filter(function(key) {
            return key.indexOf('PlayerBlackCat_run_') == 0
        }).map(function(key) {
            return frames[key]
        })
        this.host.animationComponent.actionManager.runAction(FrameChange.create(animationFrames, 5))
        return this
    }
    update(session) {
        const input = session.commandInputComponent
        const leftPressed = input.getInput(InputState.Left)
        const rightPressed = input.getInput(InputState.Right)
        const jumpPressed = input.getInput(InputState.Jump)
        const firePressed = input.getInput(InputState.Fire)

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

        const velocitySwimX = this.velocitySwimX
        const velocityMoveX = this.velocityMoveX

        if (leftPressed != rightPressed) {
            if (leftPressed) {
                velocityX = touchWater ? -velocitySwimX : -velocityMoveX
                scaleX = -1
            }
            if (rightPressed) {
                velocityX = touchWater ? velocitySwimX : velocityMoveX
                scaleX = 1
            }
        } else {
            if (absX < 2) {
                velocityX = 0
            } else {
                velocityX = dirVx * (absX - 2)
            }
        }

        switch (this.stateY) {
            case 0:
                if (this.canJump && touchGround && jumpPressed && !(this.prevInput & InputState.Jump)) {
                    this.currentJumpIndex = 0
                    const jump = this.jumps[this.currentJumpIndex]
                    jump.holdNumber = 0
                    jump.frameNumber = 0
                    velocityY = jump.velocities[0]
                    this.stateY = 1
                    break
                }
                if (this.applyGravity) {
                    velocityY += this.gravity.y
                }
                break
            default:
                if (touchGround || touchTop) {
                    this.stateY = 0
                    break
                }
                const jump = this.jumps[this.currentJumpIndex]

                if (!jumpPressed) {
                    jump.holdNumber = 0
                } else {
                    jump.holdNumber++
                }

                if (this.canJump && (this.currentJumpIndex + 1) < this.jumpAbility && (jump.holdNumber > jump.frameNumberThreshold)) {
                    const nextJump = this.jumps[++this.currentJumpIndex]
                    nextJump.frameNumber = 0
                    nextJump.holdNumber = 0
                    velocityY = nextJump.velocities[nextJump.frameNumber]
                    this.stateY++
                } else {
                    if (jump.frameNumber >= jump.velocities.length) {
                        jump.frameNumber = 0
                        this.stateY = 0

                    } else {
                        velocityY = jump.velocities[jump.frameNumber]
                    }
                    ++jump.frameNumber
                }
                break
        }
        this.velocity.update(velocityX, Math.max(-this.velocityMaxY, Math.min(this.velocityMaxY, velocityY)))
        node.spaceComponent.scale.x = scaleX
        this.prevInput = input.getMask()
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
        this.gravity.remove()
        this.gravity =
            this.jumps = null
        this._collect()
    }
    _collect() {
        HeroStateComponent.collect(this)
    }
}

const caches = []
HeroStateComponent.create = function(host) {
    return (caches.length ? caches.pop() : new HeroStateComponent).init(host)
}
HeroStateComponent.collect = function(component) {
    caches.push(component)
}
HeroStateComponent.clean = function() {
    caches.length = 0
}
export default HeroStateComponent