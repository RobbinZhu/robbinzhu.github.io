class HeroStateComponent {
    constructor() {}
    init(host) {
        this.host = host
        this.canJump = false
        this.tryToJump = false
        this.inSmallJump = false

        //小跳跳跃了多少帧
        this.smallJumpFramesNumber = 0

        //18帧//160
        this.smallJumpVelocities = [
            12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
            10, 8, 6, 6, 4, 4, 2, 0
        ]

        this.inBigJump = false

        //当前跳跃到10帧则切换成大跳
        this.bigJumpFramesThreshold = 10
        this.canBigJump = false

        //30帧.//224
        this.bigJumpVelocities = [
            14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
            12, 12, 12, 12, 12, 12, 10, 10, 8, 8,
            6, 6, 6, 6, 0, 0, 0, 0, 0, 0
        ]

        //当前跳跃的帧数，大小跳时都需要自增
        this.currentJumpFramesCount = 0

        this.canMove = true
        this.tryToMove = false

        this.isHurt = false

        this.velocityMoveX = 10
        this.velocitySwimX = 6
        this.velocityJumpX = 12
        this.velocityMaxY = 30
        this.jumpMax = 2
        this.prevJumpPressed = null
        this.stateX = null
        this.stateY = null
        this.jumpFrameCount = 0
        this.jumpHoldFrameCount = 0
        this.smallJumpThreshold = 10
        this.jumpNumber = 0
        this.prevTouchWall = false
        this.touchWallCount = 0

        return this
    }
    changeStateXTo(state) {
        this.stateX = state
    }

    changeStateYTo(state) {
        // console.log(stateY, '>', state)
        this.stateY = state
    }
    update(session) {
        const leftPressed = session.commandInputComponent.getInput(1)
        const rightPressed = session.commandInputComponent.getInput(2)
        const jumpPressed = session.commandInputComponent.getInput(4)
        const node = this.host

        // const input = node.inputComponent.getInput()

        const physicsComponent = node.physicsComponent
        let velocityX = physicsComponent.velocity.x
        let velocityY = physicsComponent.velocity.y

        const absX = Math.abs(velocityX)
        const absY = Math.abs(velocityY)
        const dirVx = velocityX >= 0 ? 1 : -1
        const dirVy = velocityY >= 0 ? 1 : -1
        let scaleX = node.spaceComponent.scale.x
        const touchGround = physicsComponent.touchGround
        const touchTop = physicsComponent.touchTop
        const touchLeft = physicsComponent.touchLeft
        const touchRight = physicsComponent.touchRight
        const touchWater = false

        const velocitySwimX = this.velocitySwimX
        const velocityMoveX = this.velocityMoveX

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

        let jumpFrameCount = this.jumpFrameCount
        let jumpHoldFrameCount = this.jumpHoldFrameCount
        const smallJumpVelocities = this.smallJumpVelocities

        const bigJumpVelocities = this.bigJumpVelocities

        switch (this.stateY) {
            case 'small_jump':
                if (touchTop) {
                    this.changeStateYTo('none')
                    velocityY = 0
                    jumpFrameCount = 0
                    break
                }
                if (!jumpPressed) {
                    jumpHoldFrameCount = 0
                } else {
                    jumpHoldFrameCount++
                }
                if (jumpHoldFrameCount && ((jumpFrameCount + 1) >= this.smallJumpThreshold)) {
                    this.changeStateYTo('big_jump')
                    break
                }

                if (jumpFrameCount < smallJumpVelocities.length) {
                    velocityY = -smallJumpVelocities[jumpFrameCount++]
                } else {
                    this.changeStateYTo('none')
                    velocityY = 0
                }
                if (absX && (leftPressed != rightPressed)) {
                    velocityX = dirVx * this.velocityJumpX
                }
                break
            case 'big_jump':
                if (touchTop) {
                    this.changeStateYTo('none')
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
                    this.changeStateYTo('none')
                    velocityY = 0
                    jumpFrameCount = 0
                }
                if (absX && (leftPressed != rightPressed)) {
                    velocityX = dirVx * this.velocityJumpX
                }
                break
            default:
                if (touchGround || touchTop) {
                    this.jumpNumber = 0
                }
                if (touchGround && !this.prevJumpPressed && jumpPressed) {
                    this.changeStateYTo('small_jump')
                    this.jumpNumber++

                        jumpFrameCount = 0
                    break
                }
                if (this.jumpNumber < this.jumpMax && !this.prevJumpPressed && jumpPressed) {
                    this.changeStateYTo('small_jump')
                    this.jumpNumber++

                        jumpFrameCount = 0
                    break
                }
                if (this.prevTouchWall && (touchLeft || touchRight)) {
                    this.touchWallCount++
                } else {
                    this.touchWallCount = 0
                    this.prevTouchWall = false
                }
                if (this.touchWallCount >= 18 && velocityY > 6) {
                    if (!prevJumpPressed && jumpPressed && (touchLeft || touchRight)) {
                        this.changeStateYTo('small_jump')
                    }
                    break
                } else {
                    velocityY += 2
                }
                if (velocityY > this.velocityMaxY) {
                    velocityY = this.velocityMaxY
                }
                break
        }
        this.jumpFrameCount = jumpFrameCount
        this.jumpHoldFrameCount = jumpHoldFrameCount
        physicsComponent.velocity.update(velocityX, velocityY)
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