import Frame from './frame.js'

class Texture {
    constructor() {}
    init(source, x, y, width, height) {
        this.source = source
        this.frame = Frame.create(x, y, width, height)
        return this
    }
    renderToSession(session, width, height) {
        session.drawImage(this.source, this.frame.x, this.frame.y, this.frame.width, this.frame.height, 0, 0, width, height)
    }
    update() {
        return this
    }
    remove() {
        this.frame.remove()
        this.source = this.frame = null
        Texture.collect(this)
    }
}

const caches = []
Texture.create = function(source, x, y, width, height) {
    return (caches.length ? caches.pop() : new Texture).init(source, x, y, width, height)
}
Texture.collect = function() {
    caches.push(this)
}
Texture.clean = function() {
    caches.length = 0
}

export default Texture