import Texture from '../../common/texture.js'
import throttle from '../../common/throttle.js'
import ImageLoader from '../../common/image_loader.js'
import InputState from './input_state.js'
import BulletStateComponent from './bullet_state.js'
import PubsubComponent from '../../component/pubsub_component.js'

import StateBaseComponent from './state_base.js'

import HeroStateComponent from './hero_state.js'
import SceneStateComponent from './scene_state.js'
import FrogStateComponent from './frog_state.js'
import ParallaxStateComponent from './parallax_state.js'
import Scene from '../../node/scene.js'
import Node from '../../node/node.js'
import FadeTo from '../../action/fade_to.js'
import Button from '../button.js'

import TiledComponent from '../my_tiled.js'

const Nodes = {
    'Node': Node,
    'Scene': Scene,
    'Button': Button
}

const stateComponents = {
    HeroStateComponent,
    SceneStateComponent,
    FrogStateComponent,
    ParallaxStateComponent
}

function getTargetType(type) {
    return Nodes[type] || Node
}

function buildNode(config) {
    const Target = getTargetType(config.type)
    if (!Target) {
        return
    }
    const node = Target.create(config.name, config)
    if (typeof config.width == 'string') {
        node.addHookSupport()
        const width = parseFloat(config.width)
        const height = parseFloat(config.height)
        node.hookComponent.onUpdate.push(function(session) {
            this.spaceComponent.width = width * session.design.resolution.x
            this.spaceComponent.height = height * session.design.resolution.y
        })
    } else {
        node.spaceComponent.width = config.width
        node.spaceComponent.height = config.height
    }
    if (config.hasOwnProperty('zIndex')) {
        node.nodeTreeComponent.zIndex = config.zIndex
    }
    if (config.hasOwnProperty('anchorX')) {
        node.spaceComponent.anchor.update(config.anchorX, config.anchorY)
    }
    node.spaceComponent.position.update(config.x, config.y)
    if (config.hasOwnProperty('notUseCamera')) {
        node.graphicsComponent.notUseCamera = config.notUseCamera
    }
    if (config.textures) {
        config.textures.forEach(function(texture, index, textures) {
            ImageLoader.load(texture.image).then(function(image) {
                const args = texture.size ? texture.size.slice(0) : []
                args.unshift(image)

                texture.texture = Texture.create.apply(Texture, args)
                if (textures.length == 1) {
                    node.graphicsComponent.texture = texture.texture
                }
            })
        })
    }
    if (config.onUpdate) {
        node.addHookSupport()
        node.hookComponent.onUpdate.push(config.onUpdate)
    }
    if (config.hasOwnProperty('relative')) {
        node.addHookSupport()
        const relativeX = config.relative.x
        const relativeY = config.relative.y
        const x = config.x
        const y = config.y
        node.hookComponent.onUpdate.push(function(session) {
            // this.spaceComponent.position.x = session.design.resolution.x + floatRight
            this.spaceComponent.position.update(
                x + relativeX * session.design.resolution.x,
                y + relativeY * session.design.resolution.y
            )
        })
    }
    node.graphicsComponent.color = config.color
    return node
}

function addChildren(parent, children, shared) {
    if (!children) {
        return
    }
    for (let j = 0; j < children.length; j++) {
        const config = children[j]
        const node = buildNode(config)

        if (config.touchable) {
            node.spaceComponent.touchable = true
        }
        if (config.touchInput) {
            node.spaceComponent.touchInput = config.touchInput
        }
        if (config.keyInput) {
            node.spaceComponent.keyInput = config.keyInput
        }
        if (config.state) {
            node.addStateComponent(stateComponents[config.state].create(node))
        }
        if (config.cameraFollow) {
            shared.cameraFollow = node
        }

        node && parent.nodeTreeComponent.addChild(node)
        addChildren(node, config.children)
    }
    parent.nodeTreeComponent.sortChildren()
}

function createScene(config, width, height) {
    const scene = Scene.create(config.name)
    const shared = {
        cameraFollow: null
    }
    if (config.hasCamera) {
        scene.addCameraSupport(width, height)
    }
    if (config.tile) {
        TiledComponent.init(config.tile, function(tileMap) {
            scene.setTile(tileMap)

            if (config.state) {
                scene.addStateComponent(stateComponents[config.state].create(scene))
            }
            addChildren(scene, config.children, shared)

            if (shared.cameraFollow) {
                if (scene.cameraComponent) {
                    scene.cameraComponent.position.set(shared.cameraFollow.spaceComponent.position)
                }
                scene.cameraComponent.follow(shared.cameraFollow)
            }
        })
    } else {
        if (config.state) {
            scene.addStateComponent(stateComponents[config.state].create(scene))
        }
        addChildren(scene, config.children, shared)

        if (shared.cameraFollow) {
            if (scene.cameraComponent) {
                scene.cameraComponent.position.set(shared.cameraFollow.spaceComponent.position)
            }
            scene.cameraComponent.follow(shared.cameraFollow)
        }
    }
    return scene
}

function transitionTo(app, scene) {
    app.pushScene(function(app) {
        const from = app.currentScene
        from.pause()
        from.addAnimationSupport()

        scene.graphicsComponent.alpha = 0
        scene.addAnimationSupport()

        const time = 1000
        Promise.resolve()
            .then(function() {
                return new Promise(function(resolve, reject) {
                    from.animationComponent.actionManager.runAction(FadeTo.create(0, time, null, resolve))
                })
            })
            .then(function() {
                return new Promise(function(resolve, reject) {
                    app.nextScene = scene
                    scene.animationComponent.actionManager.runAction(FadeTo.create(1, time, null, resolve))
                })
            })
            .then(function() {
                app.pushScene(scene)
                scene.resume()
            })
    })
}
class AppStateComponent {
    constructor() {}
    init(host, config) {
        this.host = host

        this.pubsubComponent = PubsubComponent.create(this)

        this.pubsubComponent.on('navigate', function(name) {
            let scene = host.getScene(name)
            if (!scene) {
                for (var i = 0; i < config.scenes.length; i++) {
                    if (config.scenes[i].name === name) {
                        scene = createScene(config.scenes[i], config.width, config.height)
                        break
                    }
                }
            }
            if (scene) {
                transitionTo(this.host, scene)
            }
        })
        if (config.scenes) {
            for (let i = 0; i < config.scenes.length; i++) {
                const sceneConfig = config.scenes[i]
                if (!sceneConfig.isMain) {
                    continue
                }

                this.host.pushScene(createScene(sceneConfig, config.width, config.height))
            }
        }
        return this
    }
    transitionTo(config) {
        this.host.getScene(config.name)
    }
    update(session) {}
    remove() {
        this.pubsubComponent.remove()
        this.host = null
        this.pubsubComponent = null
        AppStateComponent.collect(this)
    }
}


const caches = []
AppStateComponent.create = function(host, config) {
    return (caches.length ? caches.pop() : new AppStateComponent).init(host, config)
}
AppStateComponent.collect = function(component) {
    caches.push(component)
}
AppStateComponent.clean = function() {
    caches.length = 0
}

export default AppStateComponent