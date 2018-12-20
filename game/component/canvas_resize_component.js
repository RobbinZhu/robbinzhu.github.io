class CanvasResizeComponent {
    constructor() {}
    init(canvas) {
        this.canvas = canvas
        this.width = -1
        this.height = -1
        this.scaleRatio = -1
        return this
    }
    resize() {
        const scaleRatio = window.devicePixelRatio
        console.log('resize', scaleRatio)

        let fullWidth = window.innerWidth
        let fullHeight = window.innerHeight

        // console.log(fullWidth, fullHeight)
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
        CanvasResizeComponent.collect(this)
    }
}


const caches = []

CanvasResizeComponent.create = function(canvas) {
    return (caches.length ? caches.pop() : new CanvasResizeComponent).init(canvas)
}

CanvasResizeComponent.collect = function(component) {
    caches.push(component)
}

CanvasResizeComponent.clean = function() {
    caches.length = 0
}

export default CanvasResizeComponent