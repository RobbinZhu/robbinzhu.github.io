class Rotation {
    constructor() {}
    clone() {
        return Rotation.create(this.angle)
    }
    add(angle) {
        return this.update(this.angle + angle)
    }
    set(angle) {
        if (this.angle != angle) {
            this.update(angle)
        }
        return this
    }
    reset() {
        this.angle = 0
        this.sin = 0
        this.cos = 1
        return this
    }
    update(angle) {
        this.angle = angle
        this.sin = Math.sin(angle)
        this.cos = Math.cos(angle)
        return this
    }
    remove() {
        Rotation.collect(this)
    }
}

const caches = []

Rotation.create = function(angle) {
    return (caches.length ? caches.pop() : new Rotation).update(angle)
}

Rotation.collect = function(rotation) {
    caches.push(rotation)
}

Rotation.clean = function() {
    caches.length = 0
}

export default Rotation