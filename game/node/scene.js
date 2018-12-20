import Node from './node.js'
import CameraComponent from '../component/camera_component.js'
import TileGridComponent from '../component/tile_grid_component.js'
class Scene extends Node {
    constructor() {
        super()
    }
    init(name) {
        super.init(name)
        this.cameraComponent = null
        this.tileComponent = null
        this.tileGridComponent = null
        return this
    }
    setTile(tile) {
        this.tileComponent = tile
        this.nodeTreeComponent.addChild(tile)
        this.tileGridComponent = TileGridComponent.create(this, tile)
    }
    addCameraSupport(width, height) {
        this.cameraComponent = CameraComponent.create(width, height)
    }
    handleInput(session) {
        if (this.isPaused) {
            return
        }
        session.commandInputComponent.reset()
        const touchEvents = session.domEventComponent.touchEvents
        const keyEvents = session.domEventComponent.keyEvents
        this.nodeTreeComponent.children.forEach(function(child) {
            if (child.spaceComponent) {
                const touched = child.spaceComponent.handleKeyboardEvents(keyEvents) || child.spaceComponent.handleTouches(touchEvents)
                touched && session.commandInputComponent.addInput(child.spaceComponent.touchInput)
            }
        })
    }
    update(session) {
        const camera = this.cameraComponent
        this.handleInput(session, camera)

        super.update(session, camera, this.spaceComponent._matrix)

        this.tileComponent && this.tileComponent.updateCollision(camera, this)

        this.tileGridComponent && this.tileGridComponent.update(session, camera)
        camera && camera.update(session)
        return this
    }
    updateChildren(session, camera, parentMatrix) {
        /*this.tileGridComponent.childrenInView.forEach(function(child) {
            child && child.update(session, camera, parentMatrix)
        })*/
        this.nodeTreeComponent.children.forEach(function(child) {
            child && child.update(session, camera, parentMatrix)
        })
    }
    render(session) {
        // this.tileComponent && this.tileComponent.render(session, this.cameraComponent, this.graphicsComponent.alpha)
        this.renderChildren(session, this.cameraComponent, this.graphicsComponent.alpha)
    }
    remove() {
        super.remove()
        this.cameraComponent && this.cameraComponent.remove()
        this.tileComponent && this.tileComponent.remove()
        this.tileGridComponent && this.tileGridComponent.remove()
        this.childrenInView = this.cameraComponent = this.tileComponent = this.tileGridComponent = null
    }
    _collect() {
        Scene.collect(this)
    }
}

const caches = []

Scene.create = function(name) {
    return (caches.length ? caches.pop() : new Scene).init(name)
}

Scene.collect = function(scene) {
    caches.push(scene)
}

Scene.clean = function() {
    caches.length = 0
}

export default Scene