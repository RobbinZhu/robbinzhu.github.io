import Vector from '../common/vector.js'
import Matrix from '../common/matrix.js'
import Frame from '../common/frame.js'
import PubsubComponent from '../component/pubsub_component.js'

class CameraComponent {
    init(width, height) {
        this.pubsubComponent = PubsubComponent.create(this)
        this.frame = Frame.create(0, 0, 0, 0)
        this.scale = Vector.create(1.0, 1.0)
        this.position = Vector.create(0, 0)
        this.width = width
        this.height = height
        this.halfWidth = width >> 1
        this.halfHeight = height >> 1
        this._matrix = Matrix.create(1.0, 0.0, 0.0, 1.0, 0.0, 0.0)
        this._matrixI = Matrix.create(1, 0, 0, 1, 0, 0)
        this.onlyUseTranslate = true
        this._follow = null
        return this
    }
    update(session) {
        this.updateSize(session.design)
        this.updateFollowPosition()
        this.updateMatrix(session)
    }
    updateSize(design) {
        if (this.width == design.resolution.x && this.height == design.resolution.y) {
            return
        }
        this.width = design.resolution.x
        this.height = design.resolution.y
        this.halfWidth = this.width >> 1
        this.halfHeight = this.height >> 1
    }
    updateMatrix(session) {
        //cameraComponent的position就是中心点的位置
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
    updateFollowPosition() {
        if (!this._follow) {
            return
        }
        const position = this._follow.spaceComponent.position
        const deltaX = Math.ceil((this.position.x - position.x) * 0.07)
        const deltaY = Math.ceil((this.position.y - position.y) * 0.07)

        this.position.substractxy(
            Math.min(30, Math.max(-30, deltaX)),
            Math.min(30, Math.max(-30, deltaY))
        )
        if (this.position.x < this.halfWidth) {
            this.position.x = this.halfWidth
        }
    }
    follow(node) {
        this._follow = node
    }
    remove() {
        this.pubsubComponent.remove()
        this.scale.remove()
        this.position.remove()
        this._matrix.remove()
        this._matrixI.remove()
        this.frame.remove()
        this.pubsubComponent =
            this.scale =
            this.position =
            this._matrix =
            this._matrixI =
            this.frame =
            this._follow = null
        this._collect()
    }
    _collect() {
        CameraComponent.collect(this)
    }
}

const caches = []

CameraComponent.create = function(width, height) {
    return (caches.length ? caches.pop() : new CameraComponent).init(width, height)
}

CameraComponent.collect = function(cameraComponent) {
    caches.push(cameraComponent)
}

CameraComponent.clean = function() {
    caches.length = 0
}

export default CameraComponent