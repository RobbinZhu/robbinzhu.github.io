import Vector from '../common/vector.js'
import Matrix from '../common/matrix.js'
import Frame from '../common/frame.js'
import debounce from '../common/debounce.js'

import CanvasResizeComponent from '../component/canvas_resize_component.js'
import CommandInputComponent from '../component/command_input_component.js'
import DomEventComponent from '../component/dom_event_component.js'
import PubsubComponent from '../component/pubsub_component.js'

class SessionComponent {
    constructor() {}
    init(dom) {
        this.display = {
            canvas: dom,
            ctx: dom.getContext('2d'),
            // resolution: Vector.create(0, 0),
            width: 0,
            height: 0,
            baseTransform: Matrix.create(1, 0, 0, 1, 0, 0),
            _baseTransformI: Matrix.create(1, 0, 0, 1, 0, 0),
            scaleRatio: 1
        }
        this.pubsubComponent = PubsubComponent.create(this)
        this.domEventComponent = DomEventComponent.create(dom, this)
        this.domEventComponent.listenTouchEvents()
        this.design = {
            width: 0,
            height: 0,
            maxWidth: 0,
            maxHeight: 0,
            resolution: Vector.create(0, 0)
        }
        this.deltaTime = 16.66
        this.currentTime = 0
        this.frameNumber = 60
        this.frameCount = 0
        this.frameRefreshCount = 0
        this.canvasResizeComponent = CanvasResizeComponent.create(dom)
        this.commandInputComponent = CommandInputComponent.create()
        this.resizeEventHandler = debounce(this.resize.bind(this), 100)
        this.listen(this.resizeEventHandler)
        return this
    }
    listen(resize) {
        window.removeEventListener('resize', resize)
        window.addEventListener('resize', resize)
    }
    addCommandInputComponent(component) {
        this.commandInputComponent || (this.commandInputComponent = (component || CommandInputComponent.create()))
    }
    getTransform() {
        return this.display.baseTransform
    }
    resize() {
        const size = this.canvasResizeComponent.resize()
        this.display.width = size.width
        this.display.height = size.height
        this.display.scaleRatio = size.scaleRatio

        const fullW = size.width
        const fullH = size.height

        const designW = this.design.width
        const designH = this.design.height
        const maxWidth = this.design.maxWidth
        const maxHeight = this.design.maxHeight

        const fullRatio = fullW / fullH
        const designRatio = designW / designH

        let width = 0
        let height = 0
        let realRatio
        if (fullRatio > designRatio) {
            //dom过宽，高度可以固定
            realRatio = fullH / designH
            const computedFullWidth = Math.ceil(fullW / realRatio)
            width = Math.min(maxWidth, computedFullWidth)
            height = designH
        } else {
            realRatio = fullW / designW

            const computedFullHeight = Math.ceil(fullH / realRatio)
            height = Math.min(maxHeight, computedFullHeight)
            width = designW
        }
        this.design.resolution.update(width, height)
        const paddingX = width * realRatio - fullW
        const paddingY = height * realRatio - fullH
        this.display.baseTransform.update(1 / realRatio, 0, 0, 1 / realRatio, 1 / realRatio * paddingX * 0.5, 1 / realRatio * paddingY * 0.5)
        this.display._baseTransformI.update(realRatio, 0, 0, realRatio, -paddingX * 0.5, -paddingY * 0.5)
        this.pubsubComponent.pub('resolution-change', this.design)
    }
    clear() {
        this.display.ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.display.ctx.clearRect(0, 0, this.display.width, this.display.height)
    }
    setTransform(a, b, c, d, e, f) {
        this.display.ctx.setTransform(a, b, c, d, e, f)
    }
    setTransformMatrix(matrix) {
        this.display.ctx.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f)
    }
    setAlpha(alpha) {
        this.display.ctx.globalAlpha = alpha
    }
    computeRenderCost() {
        const now = Date.now()
        if (this.currentTime > 0) {
            const cost = now - this.currentTime
            this.frameRefreshCount += cost
            if (++this.frameCount >= 60) {
                this.frameNumber = (60000 / this.frameRefreshCount).toFixed(1)
                this.frameCount = 0
                this.frameRefreshCount = 0
            }
            // console.log(this.frameCount)
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
        ctx.fillText(this.frameNumber, 50, 50)
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
    setResolution(width, height, maxWidth, maxHeight) {
        this.design.width = width
        this.design.height = height
        this.design.maxWidth = maxWidth
        this.design.maxHeight = maxHeight
        this.resize()
    }
    remove() {
        this.pubsubComponent.remove()
        window.removeEventListener('resize', this.resizeEventHandler)
        this.canvasResizeComponent.remove()
        this.display.baseTransform.remove()
        this.display._baseTransformI.remove()
        this.domEventComponent.remove()
        this.commandInputComponent && this.commandInputComponent.remove()
        this.pubsubComponent =
            this.display =
            this.resizeEventHandler =
            this.domEventComponent =
            this.canvasResizeComponent =
            this.commandInputComponent =
            this.design = null

        SessionComponent.collect(this)
    }
}

const caches = []

SessionComponent.create = function(dom) {
    return (caches.length ? caches.pop() : new SessionComponent).init(dom)
}

SessionComponent.collect = function(component) {
    caches.push(component)
}

SessionComponent.clean = function() {
    caches.length = 0
}

export default SessionComponent