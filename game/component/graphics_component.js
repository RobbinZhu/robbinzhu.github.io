class GraphicsComponent {
    constructor() {}
    init() {
        this.texture = null
        this.color = null
        this.alpha = 1
        this.alphaComputed = 1
        this.width = 0
        this.height = 0
        this.notUseCamera = false
        return this
    }
    setColor(color) {
        this.color = color
    }
    update(session, camera, matrix) {
        if (this.texture) {
            this.texture.update()
        }
        return this
    }
    prepareGraphicsInfo(session, matrix, parentAlpha, width, height) {
        this.alphaComputed = parentAlpha * this.alpha
        session.setTransformMatrix(matrix)
        session.setAlpha(this.alphaComputed)

        this.width = width
        this.height = height
    }
    setGraphicsInfo(session, camera, matrix, parentAlpha, width, height) {
        if (this.texture && this.texture.rotated) {
            matrix.translate(
                0,
                height
            )
            matrix.rotate(-Math.PI * 0.5)
        }
        if (camera && !this.notUseCamera) {
            camera._matrixI.transformMatrixTo(matrix, matrix)
        } else {
            session.display._baseTransformI.transformMatrixTo(matrix, matrix)
        }
        this.alphaComputed = parentAlpha * this.alpha
        session.setTransformMatrix(matrix)
        session.setAlpha(this.alphaComputed)

        this.width = width
        this.height = height

    }
    render(session, camera) {
        if (this.texture) {
            this.renderTexture(session, this.texture)
        } else if (this.color) {
            this.draw(session, this.color)
        }
    }
    renderTexture(session, texture) {
        texture.renderToSession(session, this.width, this.height)
    }
    draw(session, color) {
        session.draw(color, 0, 0, this.width, this.height)
        return this
    }
    updateAlphaRatio(ratio) {
        this.alphaComputed = this.alpha * ratio
    }
    remove() {
        this.texture =
            this.color = null
        GraphicsComponent.collect(this)
    }
}

const caches = []
GraphicsComponent.create = function() {
    return (caches.length ? caches.pop() : new GraphicsComponent).init()
}
GraphicsComponent.collect = function(component) {
    caches.push(component)
}
GraphicsComponent.clean = function() {
    caches.length = 0
}
export default GraphicsComponent