import Vector from './vector.js'
import Matrix from './matrix.js'
// import ActionManager from '../action/action_manager.js'
import Frame from './frame.js'
import Pubsub from './pubsub.js'

class Camera {
    init(width, height) {
        this.frame = Frame.create(0, 0, 0, 0)
        this.scale = Vector.create(1.0, 1.0)
        this.position = Vector.create(0, 0)
        this.width = width
        this.height = height
        this.halfWidth = width >> 1
        this.halfHeight = height >> 1
        this._matrix = Matrix.create(1.0, 0.0, 0.0, 1.0, 0.0, 0.0)
        this._matrixI = Matrix.create(1, 0, 0, 1, 0, 0)
        this._displayMatrix = Matrix.create(1, 0, 0, 1, 0, 0)
        this.onUpdate = null
        this.onlyUseTranslate = true
        this._scene = null
        return this
    }
    on() {
        Pubsub.on.apply(this, arguments)
    }
    off() {
        Pubsub.off(this)
    }
    update(session) {
        if (this.onUpdate) {
            this.onUpdate(session)
        }
        this.updateMatrix(session)
    }
    updateSize(session) {
        this.width = session.design.resolution.x
        this.height = session.design.resolution.y
        this.halfWidth = this.width >> 1
        this.halfHeight = this.height >> 1
    }
    updateMatrix(session) {
        //camera的position就是中心点的位置
        const halfWidth = this.halfWidth
        const halfHeight = this.halfHeight
        if (this.onlyUseTranslate) {
            const tx = this.position.x - halfWidth
            const ty = this.position.y - halfHeight

            this._matrix.update(1, 0, 0, 1, tx, ty)

            this._matrixI.update(1, 0, 0, 1, -tx, -ty)

            this.frame.update(tx, ty, this.width, this.height)
        } else {
            const sx = this.scale.x
            const sy = this.scale.y

            const tx = this.position.x - sx * halfWidth
            const ty = this.position.y - sx * halfHeight
            this._matrix
                .update(
                    sx,
                    0,
                    0,
                    sy,
                    tx,
                    ty
                )
            this._matrixI.update(sx != 1 ? 1 / sx : 1, 0, 0, sy != 1 ? 1 / sy : 1, -tx, -ty)

            this.frame.update(tx, ty, this.width * sx, this.height * sy)
        }
        session.display._baseTransformI.transformMatrixTo(this._matrixI, this._matrixI)
        return this
    }
    remove() {
        this.off()
        this.scale.remove()
        this.position.remove()
        this._matrix.remove()
        this._matrixI.remove()
        this.frame.remove()
        this.scale =
            this._scene =
            this.position =
            this._matrix =
            this._matrixI =
            this.frame = null
        this._collect()
    }
    _collect() {
        Camera.collect(this)
    }
}

const caches = []

Camera.create = function(width, height) {
    return (caches.length ? caches.pop() : new Camera).init(width, height)
}

Camera.collect = function(camera) {
    caches.push(camera)
}

Camera.clean = function() {
    caches.length = 0
}

export default Camera