import TouchBase from './touch_base.js'
import Matrix from './matrix.js'
class Scene extends TouchBase {
    constructor() {
        super()
    }
    init(name) {
        this.name = name
        this.color = null
        this.alpha = 1
        this._camera = null
        // this._matrix = Matrix.create(1, 0, 0, 1, 0, 0)
        this.isPaused = false
        this.isActive = true
        return this
    }
    setCamera(camera) {
        this._camera = camera
        camera._scene = this
        return this
    }
    pause() {
        this.isPaused = true
    }
    resume() {
        this.isPaused = false
    }
    update(session) {
        const camera = this._camera
        this.alpha_computed = this.alpha
        this.handleOnUpdate(session)
        this.updateAction(session)
        if (!this.isPaused) {
            this.performEvents(session, camera)
        }
        for (let i = 0, j = this.children.length; i < j; i++) {
            const child = this.children[i]
            child && child.isActive && child.update(session, camera)
        }
        if (camera) {
            camera.update(session)
        }
        this.handleAfterUpdate(session)
        return this
    }
    render(session) {
        const camera = this._camera

        for (let i = 0, j = this.children.length; i < j; i++) {
            const child = this.children[i]
            child && child.render(session, camera)
        }
        return this
    }
    remove() {
        super.remove()
        this._matrix.remove()
        this._camera.remove()
        this.name =
            this.color =
            this._camera =
            this._matrix = null
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