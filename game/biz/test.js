import App from '../node/app.js'
import Scene from '../node/scene.js'
import Node from '../node/node.js'
import Button from './button.js'
import SessionComponent from '../component/session_component.js'

import getCanvas from './main_canvas.js'
import config from './game_config.js'

import AppStateComponent from './component/app_state.js'
import HeroStateComponent from './component/hero_state.js'
import SceneStateComponent from './component/scene_state.js'
import FrogStateComponent from './component/frog_state.js'
// import MonsterStateComponent from './component/monster_state_component.js'
import FadeTo from '../action/fade_to.js'

import TiledComponent from './my_tiled.js'
import tileData from './tilemap_sample.js'
const tile = TiledComponent.create(tileData, 6, 6)

const stateComponents = {
    HeroStateComponent,
    SceneStateComponent,
    FrogStateComponent,
    AppStateComponent
}

const Nodes = {
    'Node': Node,
    'Scene': Scene,
    'Button': Button
}

function buildApp() {
    return App.create()
}

function buildScene(name) {
    return Scene.create(name)
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
    node.spaceComponent.width = config.width
    node.spaceComponent.height = config.height
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
}

function main(config) {
    const session = SessionComponent.create(getCanvas())
    session.setResolution(config.width, config.height, config.maxWidth, config.maxHeight)
    if (config.keyboards) {
        session.domEventComponent.listenKeyEvents(config.keyboards.split('').map(function(char) {
            return char.charCodeAt(0)
        }))
    }
    const app = buildApp()
    app.addSessionSupport(session)
    if (config.state) {
        app.addStateComponent(stateComponents[config.state].create(app, config))
    }
    app.run()
}

main(config)