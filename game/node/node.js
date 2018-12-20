import PubsubComponent from '../component/pubsub_component.js'
import NodeTreeComponent from '../component/node_tree_component.js'
import GraphicsComponent from '../component/graphics_component.js'
import AnimationComponent from '../component/animation_component.js'
import HookComponent from '../component/hook_component.js'
import SpaceComponent from '../component/space_component.js'
import StateComponent from '../component/state_component.js'

class Node {
    constructor() {}
    init(name) {
        this.name = name
        this.isPaused = false
        this.isActive = true

        //parent/children/zIndex
        this.nodeTreeComponent = NodeTreeComponent.create(this)

        //texture/color
        this.graphicsComponent = GraphicsComponent.create()

        //position/rotation/scale/anchor/width/height/frame/_matrix
        this.spaceComponent = SpaceComponent.create()

        //can pub/sub events
        this.pubsubComponent = null

        //onUpdate/afterUpdate/onRemove
        this.hookComponent = null

        //actionManager
        this.animationComponent = null

        this.stateComponent = null

        return this
    }
    addStateComponent(component) {
        this.stateComponent || (this.stateComponent = (component || StateComponent.create(this)))
    }
    addPubsubSupport() {
        this.pubsubComponent || (this.pubsubComponent = PubsubComponent.create(this))
    }
    addHookSupport() {
        this.hookComponent || (this.hookComponent = HookComponent.create(this))
    }
    addAnimationSupport() {
        this.animationComponent || (this.animationComponent = AnimationComponent.create(this))
    }
    pause() {
        this.isPaused = true
    }
    resume() {
        this.isPaused = false
    }
    active() {
        this.isActive = true
    }
    deactive() {
        this.isActive = false
    }
    update(session, camera, parentMatrix) {
        if (!this.isActive) {
            return this
        }
        //所有的组件都可与session交互

        this.hookComponent && this.hookComponent.handleOnUpdate(session, camera)

        this.animationComponent && this.animationComponent.update(session, camera)

        this.stateComponent && this.stateComponent.update(session, camera)

        //空间组件与camera交互
        this.spaceComponent.update(session, camera, parentMatrix)

        this.nodeTreeComponent.update(session, camera)

        this.updateChildren(session, camera, this.spaceComponent._matrix)

        this.hookComponent && this.hookComponent.handleAfterUpdate(session, camera)

        return this
    }
    updateChildren(session, camera, parentMatrix) {
        this.nodeTreeComponent.children.forEach(function(child) {
            child && child.update(session, camera, parentMatrix)
        })
    }
    render(session, camera, parentAlpha) {
        if (!this.isActive) {
            return
        }

        if (camera && !this.graphicsComponent.notUseCamera) {
            if (!this.spaceComponent.frame.collide(camera.frame)) {
                return
            }
        }

        this.graphicsComponent.setGraphicsInfo(session, camera, this.spaceComponent._matrix, parentAlpha, this.spaceComponent.width, this.spaceComponent.height)
        // this.graphicsComponent.prepareGraphicsInfo(session, matrix, parentAlpha, this.spaceComponent.width, this.spaceComponent.height)
        this.graphicsComponent.render(session, camera)
        this.renderChildren(session, camera, this.graphicsComponent.alphaComputed)
    }
    renderChildren(session, camera, alpha) {
        this.nodeTreeComponent.children.forEach(function(child) {
            child && child.render(session, camera, alpha)
        })
        return this
    }
    remove() {
        this.isActive = false
        this.graphicsComponent.remove()
        this.spaceComponent.remove()
        this.nodeTreeComponent.remove()
        this.pubsubComponent && this.pubsubComponent.remove()
        this.hookComponent && this.hookComponent.remove()
        this.animationComponent && this.animationComponent.remove()
        this.stateComponent && this.stateComponent.remove()
        this.graphicsComponent =
            this.spaceComponent =
            this.pubsubComponent =
            this.nodeTreeComponent =
            this.hookComponent =
            this.animationComponent =
            this.stateComponent = null
        this._collect()
    }
    _collect() {
        Node.collect(this)
    }
}

const caches = []

Node.create = function(name) {
    return (caches.length ? caches.pop() : new Node).init(name)
}

Node.collect = function(node) {
    caches.push(node)
}

Node.clean = function() {
    caches.length = 0
}

export default Node