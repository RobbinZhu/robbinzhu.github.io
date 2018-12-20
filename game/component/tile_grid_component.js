class TileGridComponent {
    constructor() {}
    init(host, tile) {
        this.host = host

        this.gridWidth = tile.gridWidth
        this.gridHeight = tile.gridHeight
        this.gridWidthI = 1 / tile.gridWidth
        this.gridHeightI = 1 / tile.gridHeight

        this.gridColumnCount = tile.gridColumnCount
        this.gridRowCount = tile.gridRowCount

        this.bufferSizeOfGrid = 0

        this.validXMin = 0
        this.validXMax = 0
        this.validYMin = 0
        this.validYMax = 0

        this.validXMinIndex = 0
        this.validXMaxIndex = 0
        this.validYMinIndex = 0
        this.validYMaxIndex = 0

        this.childrenInView = []

        return this
    }
    update(session, camera) {
        if (camera) {
            const childrenInView = this.childrenInView
            childrenInView.length = 0

            //camera所在的所有grid组成的矩形,加上buffer
            let xMin = Math.min(Math.max(0, -this.bufferSizeOfGrid + (camera.frame.x * this.gridWidthI) | 0), this.gridColumnCount)
            let xMax = Math.min(Math.max(0, this.bufferSizeOfGrid + Math.ceil(camera.frame.x2 * this.gridWidthI)), this.gridColumnCount)
            let yMin = Math.min(Math.max(0, -this.bufferSizeOfGrid + (camera.frame.y * this.gridHeightI) | 0), this.gridRowCount)
            let yMax = Math.min(Math.max(0, this.bufferSizeOfGrid + Math.ceil(camera.frame.y2 * this.gridHeightI)), this.gridRowCount)

            this.validXMinIndex = xMin
            this.validXMaxIndex = xMax
            this.validYMinIndex = yMin
            this.validYMaxIndex = yMax

            xMin *= this.gridWidth
            xMax *= this.gridWidth
            yMin *= this.gridHeight
            yMax *= this.gridHeight

            this.validXMin = xMin
            this.validXMax = xMax
            this.validYMin = yMin
            this.validYMax = yMax
            this.host.nodeTreeComponent.children.forEach(function(node) {
                if ((node.graphicsComponent && node.graphicsComponent.notUseCamera) || (node.spaceComponent && node.spaceComponent.frame.collideTo(xMin, yMin, xMax, yMax))) {
                    childrenInView.push(node)
                }
            })
        }
    }

    /*
    handleInput(session) {
        session.commandInputComponent.reset()
        const touchEvents = session.domEventComponent.touchEvents
        const keyEvents = session.domEventComponent.keyEvents
        this.childrenInView.forEach(function(child) {
            if (child.spaceComponent) {
                const touched = child.spaceComponent.handleKeyboardEvents(keyEvents) || child.spaceComponent.handleTouches(touchEvents)
                touched && session.commandInputComponent.addInput(child.spaceComponent.touchInput)
            }
        })
    }*/
    remove() {
        this.host = this.childrenInView = null
        this._collect()
    }
    _collect() {
        TileGridComponent.collect(this)
    }
}

const cache = []

TileGridComponent.create = function(...args) {
    return (cache.length ? cache.pop() : new TileGridComponent).init(...args)
}

TileGridComponent.collect = function(grid) {
    cache.push(grid)
}

TileGridComponent.clean = function() {
    cache.length = 0
}

export default TileGridComponent