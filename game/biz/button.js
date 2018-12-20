import Node from '../node/node.js'

class Button extends Node {
    constructor() {
        super()
    }
    init(name, config) {
        super.init(name)
        this.pressColor = config.pressColor
        this.normalColor = config.color

        this.textures = config.textures
        if (config.event) {
            this.addPubsubSupport()
        }
        this.event = config.event
        this.addHookSupport()
        this.pressedTime = -1
        this.hookComponent.onUpdate.push(function(session) {
            let textureIndex = 0
            if (session.commandInputComponent.getInput(this.spaceComponent.touchInput)) {
                this.graphicsComponent.color = this.pressColor
                textureIndex = 1

                if (this.event && this.pressedTime < 0) {
                    this.pressedTime = Date.now()
                }
            } else {
                if (this.event) {
                    if (this.pressedTime > 0) {
                        if ((Date.now() - this.pressedTime) > 50) {
                            // console.log(Date.now() - this.pressedTime)
                            this.pubsubComponent.pub(this.event.name, this.event.param)
                        }
                        this.pressedTime = -1
                    }
                }
                textureIndex = 0

                this.graphicsComponent.color = this.normalColor
            }
            if (this.textures) {
                this.graphicsComponent.texture = this.textures[textureIndex] && this.textures[textureIndex].texture
            }
        })
        return this
    }
}

const caches = []

Button.create = function(name, config) {
    return (caches.length ? caches.pop() : new Button).init(name, config)
}

Button.collect = function(node) {
    caches.push(node)
}

Button.clean = function() {
    caches.length = 0
}

export default Button