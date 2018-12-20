import DomEvent from './dom_event.js'
import Vector from './vector.js'
import Matrix from './matrix.js'
import Frame from './frame.js'
import canvasResize from './canvas_resize.js'
import Pubsub from './pubsub.js'

class Session {
    constructor() {}
    on() {
        Pubsub.on.apply(this, arguments)
    }
    off() {
        Pubsub.off(this)
    }
    init(dom, app, designW, designH) {
        this.display = {
            canvas: dom,
            ctx: dom.getContext('2d'),
            resolution: Vector.create(0, 0),
            width: 0,
            height: 0,
            baseTransform: Matrix.create(1, 0, 0, 1, 0, 0),
            _baseTransformI: Matrix.create(1, 0, 0, 1, 0, 0),
            scaleRatio: 1
        }
        this.domEvent = DomEvent.create(dom, this)
        this.domEvent.listenTouchEvents()
        this.design = {
            resolution: Vector.create(0, 0),
            width: 0,
            height: 0
        }

        this.currentTime = 0
        this.frameNumber = 60
        this.frameCount = 0
        this.frameRefreshCount = 0
        return this
    }
    getTransform() {
        return this.display.baseTransform
    }
    resize() {
        const size = canvasResize(this.display.canvas)
        this.display.width = size.width
        this.display.height = size.height
        this.display.scaleRatio = size.scaleRatio

        const fullW = size.width
        const fullH = size.height

        const designW = this.design.width
        const designH = this.design.height

        const fullRatio = fullW / fullH
        const designRatio = designW / designH
        let realRatio
        if (fullRatio > designRatio) {
            realRatio = fullH / designH
        } else {
            realRatio = fullW / designW
        }

        const paddingX = designW * realRatio - fullW
        const paddingY = designH * realRatio - fullH
        this.display.baseTransform.update(1 / realRatio, 0, 0, 1 / realRatio, 1 / realRatio * paddingX * 0.5, 1 / realRatio * paddingY * 0.5)
        this.display._baseTransformI.update(realRatio, 0, 0, realRatio, -paddingX * 0.5, -paddingY * 0.5)
    }
    clear() {
        this.display.ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.display.ctx.clearRect(0, 0, this.display.width, this.display.height)
    }
    setTransform(a, b, c, d, e, f) {
        this.display.ctx.setTransform(a, b, c, d, e, f)
    }
    computeRenderCost() {
        const now = Date.now()
        if (this.currentTime > 0) {
            const cost = now - this.currentTime
            this.frameRefreshCount += cost
            if (++this.frameCount >= 59) {
                this.frameNumber = (60000 / this.frameRefreshCount).toFixed(1)
                this.frameCount = 0
                this.frameRefreshCount = 0
            }
        }
        this.currentTime = now
    }
    renderFPS() {
        this.computeRenderCost()
        const ctx = this.display.ctx
        ctx.setTransform(1, 0, 0, 1, 0, 0)

        ctx.globalAlpha = 1
        ctx.font = 32 * this.display.scaleRatio + 'px Arail'
        ctx.fillStyle = 'red'

        ctx.textAlign = 'start'
        ctx.textBaseline = "top"
        ctx.fillText(this.frameNumber, 0, 0)
    }
    drawImage(texture, sx, sy, swidth, sheight, x, y, width, height) {
        this.display.ctx.drawImage(texture, sx, sy, swidth, sheight, x, y, width, height)
        return this
    }
    draw(color, x, y, width, height) {
        if (!color) {
            return
        }
        const ctx = this.display.ctx
        ctx.fillStyle = color
        ctx.fillRect(x, y, width, height)
    }
    setDrawInfo(matrix, alpha) {
        this.display.ctx.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f)
        this.display.ctx.globalAlpha = alpha
    }
    setResolution(width, height) {
        this.design.resolution.update(width, height)
        this.design.width = width
        this.design.height = height
            // this.design.canvas.width = width
            // this.design.canvas.height = height
        this.resize()
    }
    remove() {
        this.off()
    }
}
const caches = []

Session.create = function(dom, app, designW, designH) {
    return (caches.length ? caches.pop() : new Session).init(dom, app, designW, designH)
}

Session.collect = function(session) {
    caches.push(session)
}

Session.clean = function() {
    caches.length = 0
}

export default Session