import Frame from './frame.js'

class Texture {
    constructor() {}
    init(source, x, y, width, height) {
        this.source = source
        this.x = x === undefined ? 0 : x
        this.y = y === undefined ? 0 : y
        this.width = width === undefined ? source.width : width
        this.height = height === undefined ? source.height : height
        this.rotated = false
        return this
    }
    updateFrame(frame) {
        this.x = frame[0]
        this.y = frame[1]
        this.width = frame[2]
        this.height = frame[3]
        this.rotated = frame[4]
    }
    renderToSession(session, width, height) {
        if (this.rotated) {
            /*const ctx = session.display.ctx
            ctx.translate(
                0,
                this.height
            )
            ctx.rotate(-Math.PI * 0.5)
            */
            session.drawImage(
                this.source,
                this.x,
                this.y,
                this.height,
                this.width,
                0,
                0,
                height,
                width
            )

            // session.drawImage(this.source, this.frame.x, this.frame.y, this.frame.width, this.frame.height, 0, 0, width, height)

        } else {
            session.drawImage(this.source, this.x, this.y, this.width, this.height, 0, 0, width, height)
        }
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