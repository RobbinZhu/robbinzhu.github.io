import Hero from './node_hero.js'
import Vector from '../common/vector.js'
import { btnLeft, btnRight, btnJump, btnScaleUp, btnScaleDown, btnRush } from './touch_press.js'

function changeStateXTo(state) {
    stateX = state
}

function changeStateYTo(state) {
    // console.log(stateY, '>', state)
    stateY = state
}

const hero = Hero.create('hero')
const space = hero.spaceComponent
    // hero.anchor.update(0, 0)
space.position.update(100, 300)
hero.applyGravity = true
hero.graphicsComponent.color = 'red'
space.width = 68
space.height = 100
hero.nodeTreeComponent.updateZIndex(1)

//18帧//160
const smallJumpVelocities = [
    12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
    10, 8, 6, 6, 4, 4, 2, 0
]

//30帧.//226
const bigJumpVelocities = [
    12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
    10, 10, 10, 10, 10, 10, 10, 8, 8, 8, 6, 6, 0, 0,
    0, 0, 0, 0, 0, 0
]

const velocityMoveX = 10
const velocitySwimX = 6
const velocityJumpX = 12
const velocityMaxY = 30
let prevJumpPressed,
    stateX,
    stateY,
    jumpFrameCount,
    jumpHoldFrameCount = 0,
    smallJumpThreshold = 10,
    jumpNumber = 0,
    prevTouchWall,
    touchWallCount = 0
hero.addHookSupport()
hero.hookComponent.onUpdate.push(function(session, camera) {
    const jumpPressed = btnJump.pressed
    const leftPressed = btnLeft.pressed
    const rightPressed = btnRight.pressed
    const rushPressed = btnRush.pressed

    let velocityX = this.velocity.x
    let velocityY = this.velocity.y

    const absX = Math.abs(velocityX)
    const absY = Math.abs(velocityY)
    const dirVx = velocityX > 0 ? 1 : -1
    const dirVy = velocityY > 0 ? 1 : -1
    let scaleX = this.spaceComponent.scale.x
    const touchGround = this.touchGround
    const touchTop = this.touchTop
    const touchLeft = this.touchLeft
    const touchRight = this.touchRight
    const touchWater = this.touchWater

    {
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
    }

    switch (stateY) {
        case 'small_jump':
            if (touchTop) {
                changeStateYTo('none')
                velocityY = 0
                jumpFrameCount = 0
                break
            }
            if (!jumpPressed) {
                jumpHoldFrameCount = 0
            } else {
                jumpHoldFrameCount++
            }
            if (jumpHoldFrameCount && ((jumpFrameCount + 1) >= smallJumpThreshold)) {
                changeStateYTo('big_jump')
                break
            }

            if (jumpFrameCount < smallJumpVelocities.length) {
                velocityY = -smallJumpVelocities[jumpFrameCount++]
            } else {
                changeStateYTo('none')
                velocityY = 0
            }
            if (absX && (leftPressed != rightPressed)) {
                velocityX = dirVx * velocityJumpX
            }
            break
        case 'big_jump':
            if (touchTop) {
                changeStateYTo('none')
                velocityY = 0
                jumpFrameCount = 0
                break
            }
            if (!jumpPressed) {
                jumpHoldFrameCount = 0
            } else {
                jumpHoldFrameCount++
            }

            if (jumpFrameCount < bigJumpVelocities.length) {
                velocityY = -bigJumpVelocities[jumpFrameCount++]
            } else {
                changeStateYTo('none')
                velocityY = 0
                jumpFrameCount = 0
            }
            if (absX && (leftPressed != rightPressed)) {
                velocityX = dirVx * velocityJumpX
            }
            break
        default:
            if (touchGround || touchTop) {
                jumpNumber = 0
            }
            if (touchGround && !prevJumpPressed && jumpPressed) {
                changeStateYTo('small_jump')
                jumpNumber++
                jumpFrameCount = 0
                break
            }
            if (jumpNumber < 2 && !prevJumpPressed && jumpPressed) {
                changeStateYTo('small_jump')
                jumpNumber++
                jumpFrameCount = 0
                break
            }
            if (prevTouchWall && (touchLeft || touchRight)) {
                touchWallCount++
            } else {
                touchWallCount = 0
                prevTouchWall = false
            }
            if (touchWallCount >= 18 && velocityY > 6) {
                if (!prevJumpPressed && jumpPressed && (touchLeft || touchRight)) {
                    changeStateYTo('small_jump')
                }
                break
            } else {
                velocityY += 2
            }
            if (velocityY > velocityMaxY) {
                velocityY = velocityMaxY
            }
            break
    }

    this.velocity.update(velocityX, velocityY)
    this.velocityCorrection.update(0, 0)
    this.colliderToLayer(this.collideLayer, this.spaceComponent, session, camera)
    this.spaceComponent.position.add(this.velocityCorrection)

    this.spaceComponent.scale.x = scaleX
    prevJumpPressed = jumpPressed
    prevTouchWall = touchLeft || touchRight
})

hero.hookComponent.afterUpdate.push(function(session, camera) {
    const deltaX = camera.position.x - this.spaceComponent.position.x
    const deltaY = camera.position.y - this.spaceComponent.position.y
    camera.position.substractxy(
        Math.ceil(deltaX * 0.1),
        Math.ceil(deltaY * 0.1)
    )
    if (btnScaleUp.pressed) {
        camera.scale.addxy(0.01, 0.01)
    }
    if (btnScaleDown.pressed) {
        camera.scale.addxy(-0.01, -0.01)
    }
})

/*
const maxSpeed = {
    x: Infinity,
    y: Infinity
}
hero.afterUpdate.push(function(session, camera) {
    //current, target, currentVelocity, smoothTime, deltaTime, maxSpeed, output
    Vector.SmoothDampVector(camera.position, this.position, this.velocityCorrection, 0.1, 0.016, maxSpeed, camera.position)
})
*/
export default hero