import Vector from '../../common/vector.js'

class StateBaseComponent {
    constructor() {}
    init(host) {
        this.host = host
        this.velocity = Vector.create(0, 0)
        this.categoryBits = 0
        this.maskBits = 0
        return this
    }
    canCollideTo(to) {
        return (this.maskBits & to.categoryBits) && (this.categoryBits & to.maskBits)
    }
    addCollisionTo(to) {
        this.maskBits |= to.categoryBits
    }
    handle() {}
    integration() {}
    remove() {
        this.host = null
        this.velocity.remove()
        this.host = this.velocity = null
    }
}
export default StateBaseComponent