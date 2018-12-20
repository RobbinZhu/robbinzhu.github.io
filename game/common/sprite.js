import TouchBase from './touch_base.js'
import Matrix from './matrix.js'
import Frame from './frame.js'
import Vector from './vector.js'
import Rotation from './rotation.js'
import Queue from './queue.js'

let id = 0
class Sprite extends TouchBase {
    constructor() {
        super()
    }
    init(name) {
        this.name = name
        this.texture = null
        this.width = 0
        this.height = 0
        this.color = null
        this.isActive = true

        this.anchor = Vector.create(0.5, 0.5)
        this.rotation = Rotation.create(0)
        this.scale = Vector.create(1.0, 1.0)
            // this.skew = Vector.create(1.0, 1.0)
        this.position = Vector.create(0, 0)
        this.frame = Frame.create(0, 0, 0, 0)
        this._matrix = Matrix.create(1.0, 0.0, 0.0, 1.0, 0.0, 0.0)
            // this._matrix_self = Matrix.create(1.0, 0.0, 0.0, 1.0, 0.0, 0.0)

        this.alpha = 1
        this.alpha_computed = 1

        // this.actionManager = ActionManager.create(this)
        this.isPaused = false

        this.debug = false
        this.notUseCamera = false
        this.zIndex = 0
        this.id = ++id
        return this
    }
    updateZIndex(zIndex) {
        this.zIndex = zIndex
    }
    setTexture(texture, updateSize) {
        this.texture = texture
        if (updateSize) {
            this.width = texture.width
            this.height = texture.height
        }
    }
    pause() {
        this.isPaused = true
    }
    resume() {
        this.isPaused = false
    }
    remove() {
        super.remove()
    }
    update(session, camera) {
        this.handleOnUpdate(session, camera)
        this.updateAction(session)
        this.updateMatrix()

        for (let i = 0, j = this.children.length; i < j; i++) {
            const child = this.children[i]
            child && child.isActive && child.update(session, camera)
        }
        this.handleAfterUpdate(session, camera)
        return this
    }
    render(session, camera) {
        if (camera && !this.notUseCamera && !this.frame.collide(camera.frame)) {
            return this
        }
        const matrix = this._matrix
        if (camera && !this.notUseCamera) {
            camera._matrixI.transformMatrixTo(matrix, matrix)
        } else {
            session.display._baseTransformI.transformMatrixTo(matrix, matrix)
        }
        this.alpha_computed = this.parent ? this.alpha * this.parent.alpha_computed : this.alpha

        session.setDrawInfo(matrix, this.alpha_computed)

        if (this.texture) {
            this.renderTexture(session, this.texture)
        } else {
            this.draw(session, this.color)
        }
    }
    renderTexture(session, texture) {
        session.drawImage(texture.source, texture.x, texture.y, texture.width, texture.height, 0, 0, this.width, this.height)
    }
    draw(session, color) {
        session.draw(color, 0, 0, this.width, this.height)
        return this
    }
    updateMatrix(session) {
        const matrix = this._matrix

        const parent_matrix = this.parent && this.parent._matrix
        if (parent_matrix) {
            matrix.set(parent_matrix)
        } else {
            matrix.reset()
        }

        const ax = this.width * this.anchor.x
        const ay = this.height * this.anchor.y
        const tx = this.position.x
        const ty = this.position.y
        const sin = this.rotation.sin
        const cos = this.rotation.cos
        const sx = this.scale.x
        const sy = this.scale.y
        const A = cos * sx
        const B = sin * sx
        const C = -sin * sy
        const D = cos * sy
        matrix.transform(
            A,
            B,
            C,
            D,
            A * -ax + C * -ay + tx,
            B * -ax + D * -ay + ty
        )

        this.frame
            .compute(tx - ax, ty - ay, this.width, this.height, tx, ty, sin, cos, sx, sy)
        return this
    }
}

const caches = []

Sprite.create = function(name) {
    return (caches.length ? caches.pop() : new Sprite).init(name)
}

Sprite.collect = function(sprite) {
    caches.push(sprite)
}

Sprite.clean = function() {
    caches.length = 0
}

export default Sprite