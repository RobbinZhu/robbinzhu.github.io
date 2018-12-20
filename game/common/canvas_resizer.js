class CanvasResizer {
    constructor() {}
    init(canvas) {
        this.canvas = canvas
        this.width = -1
        this.height = -1
        this.scaleRatio = -1
        this.resize()
        return this
    }
    resize() {
        const scaleRatio = window.devicePixelRatio
        let fullWidth = window.innerWidth
        let fullHeight = window.innerHeight

        this.canvas.style.width = fullWidth + 'px'
        this.canvas.style.height = fullHeight + 'px'
        fullWidth *= scaleRatio
        fullHeight *= scaleRatio
        fullWidth |= 0
        fullHeight |= 0
        this.canvas.width = fullWidth
        this.canvas.height = fullHeight
        this.width = fullWidth
        this.height = fullHeight
        this.scaleRatio = scaleRatio
        return this
    }
    remove() {
        this.canvas = null
        CanvasResizer.collect(this)
    }
}


const caches = []

CanvasResizer.create = function(canvas) {
    return (caches.length ? caches.pop() : new CanvasResizer).init(canvas)
}

CanvasResizer.collect = function(CanvasResizer) {
    caches.push(CanvasResizer)
}

CanvasResizer.clean = function() {
    caches.length = 0
}

export default CanvasResizer