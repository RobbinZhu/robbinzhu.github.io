import Vector from '../common/vector.js'
import Frame from '../common/frame.js'
import Matrix from '../common/matrix.js'
import Rotation from '../common/rotation.js'
import HookComponent from './hook_component.js'
class SpaceComponent {
    constructor() {}
    init() {
        this.width = 0
        this.height = 0
        this.anchor = Vector.create(0.5, 0.5)
        this.rotation = Rotation.create(0)
        this.scale = Vector.create(1.0, 1.0)
        this.position = Vector.create(0, 0)
        this.frame = Frame.create(0, 0, 0, 0)
        this._matrix = Matrix.create(1.0, 0.0, 0.0, 1.0, 0.0, 0.0)
        this.touchable = false
            // this.isTouched = false
        this.touchInput = 0
        this.keyInput = 0
        return this
    }
    update(session, camera, parentMatrix) {
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

        const matrix = this._matrix
        if (parentMatrix) {
            matrix.set(parentMatrix)
        } else {
            matrix.reset()
        }
        matrix.transform(
            A,
            B,
            C,
            D,
            A * -ax + C * -ay + tx,
            B * -ax + D * -ay + ty
        )
        this.frame.computeWithMatrix(this.width, this.height, matrix)
        return this
    }
    handleTouches(touchEvents) {
        if (!this.touchable || !touchEvents.length) {
            return false
        }
        for (let i = touchEvents.length - 1; i >= 0; i--) {
            const event = touchEvents[i]

            if (event) {
                const x = event.x
                const y = event.y

                if (this.frame.contains(x, y)) {
                    return true
                }
            }
        }
    }
    handleKeyboardEvents(keyEvents) {
        if (!this.touchable) {
            return false
        }
        if (keyEvents[this.keyInput]) {
            return true
        }
    }
    remove() {
        this.anchor.remove()
        this.rotation.remove()
        this.scale.remove()
        this.position.remove()
        this.frame.remove()
        this._matrix.remove()
        this.anchor =
            this.rotation =
            this.scale =
            this.position =
            this.frame =
            this._matrix = null
        SpaceComponent.collect(this)
    }
}

const caches = []
SpaceComponent.create = function() {
    return (caches.length ? caches.pop() : new SpaceComponent).init()
}
SpaceComponent.collect = function(component) {
    caches.push(component)
}
SpaceComponent.clean = function() {
    caches.length = 0
}
export default SpaceComponent