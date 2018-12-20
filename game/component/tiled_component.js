import NodeTreeComponent from './node_tree_component.js'
import PubsubComponent from './pubsub_component.js'
import ImageLoader from '../common/image_loader.js'

class CollisionResolver {
    constructor() {
        this.reset()
    }
    reset() {
        this.x = 0
        this.y = 0
        this.canContinue = false
        this.canBreak = false
        return this
    }
    remove() {

    }
}

class TiledMapComponent {
    constructor() {}

    init(json, cellXInGrid, cellYInGrid) {
        this.name = 'tiledmap'

        this.nodeTreeComponent = NodeTreeComponent.create(this)
        this.isPaused = false
        this.isActive = true

        this.json = json
        this.layers = this.initLayers(json, cellXInGrid, cellYInGrid)
        this.image = null
        this.imageUrl = json.tilesets && json.tilesets[0] && json.tilesets[0].image
        this.collideLayer = this.getCollideLayer()
        this.width = json.tilewidth * json.width
        this.height = json.tileheight * json.height
        this.gridWidth = this.collideLayer.gridWidth
        this.gridHeight = this.collideLayer.gridHeight
        this.gridWidthI = 1 / this.collideLayer.gridWidth
        this.gridHeightI = 1 / this.collideLayer.gridHeight
        this.gridColumnCount = this.collideLayer.gridColumnCount
        this.gridRowCount = this.collideLayer.gridRowCount
        this.cellXInGrid = cellXInGrid
        this.cellYInGrid = cellYInGrid
        this.init = false

        this.pubsubComponent = PubsubComponent.create(this)
        this.collisionResolver = new CollisionResolver
        return this
    }
    getCollideLayer() {
        let collideLayer
        const layers = this.layers
        for (let i = 0, j = layers.length; i < j; i++) {
            const layer = layers[i]
            if (layer.name == 'main') {
                collideLayer = layer
            }
            break
        }
        return collideLayer
    }
    initLayers(tiledMap, tileCountXInGrid, tileCountYInGrid) {
        const mapLayers = tiledMap.layers
        const tileheight = tiledMap.tileheight
        const tilewidth = tiledMap.tilewidth
        const layers = []
        const tileset = tiledMap.tilesets[0]
        const countX = (tileset.imagewidth / tileset.tilewidth) | 0
        const countY = (tileset.imageheight / tileset.tileheight) | 0
        const countXI = 1 / countX
        const countYI = 1 / countY
        const image = tileset.image
        const firstgid = tileset.firstgid
        const tileoffset = tileset.tileoffset
        for (let a = 0, b = mapLayers.length; a < b; a++) {
            const layer = mapLayers[a]
            const layerwidth = layer.width
            const layerheight = layer.height
            if (!layer.visible) {
                continue
            }
            switch (layer.type) {
                case 'tilelayer':
                    const items = []
                    const layerData = {
                        tilewidth: tilewidth,
                        tileheight: tileheight,
                        gridRowCount: Math.ceil(layerheight / tileCountYInGrid),
                        gridColumnCount: Math.ceil(layerwidth / tileCountXInGrid),
                        gridWidth: tileCountXInGrid * tilewidth,
                        gridHeight: tileCountYInGrid * tileheight,
                        gridWidthI: 1 / (tileCountXInGrid * tilewidth),
                        gridHeightI: 1 / (tileCountYInGrid * tileheight),

                        name: layer.name,

                        width: layer.width,
                        height: layer.height,

                        opacity: layer.opacity,
                        type: layer.type,
                        visible: layer.visible,

                        x: layer.x,
                        y: layer.y,

                        items: items
                    }

                    layers.push(layerData)
                    const data = layer.data
                    let x = 0,
                        y = 0
                    for (let i = 0, j = data.length; i < j; i++) {
                        let gid = data[i]
                        if (gid > 0) {
                            gid -= firstgid
                            items.push([
                                gid, //x, y,
                                (gid % countX) * tileset.tilewidth - tileoffset.x, ((gid * countXI) | 0) * tileset.tileheight + tileoffset.y,
                                tilewidth, tileheight,
                                x * tilewidth, y * tileheight
                            ])
                        } else {
                            items.push(null)
                        }

                        if (++x == layerwidth) {
                            x = 0
                            y++
                        }
                    }
                    break
                case 'objectgroup':
                    for (let i = 0, j = layer.objects.length; i < j; i++) {
                        const object = layer.objects[i]
                        const gid = object.gid
                        if (gid > 0) {
                            continue
                        }
                    }
                    console.log('objectgroup not support')
                    break
            }
        }
        return layers
    }
    render(session, camera, alpha) {
        if (!this.image) {
            if (!this.init) {
                this.init = true
                ImageLoader.load(this.imageUrl).then((function(image) {
                    this.image = image
                }).bind(this))
            }
            return
        }
        const layers = this.layers
        const x1 = camera.frame.x,
            y1 = camera.frame.y,
            x2 = camera.frame.x2,
            y2 = camera.frame.y2
        const xMinIndex = Math.min(Math.max(0, (x1 * this.gridWidthI) | 0), this.gridColumnCount) * this.cellXInGrid
        const xMaxIndex = Math.min(Math.max(0, Math.ceil(x2 * this.gridWidthI)), this.gridColumnCount) * this.cellXInGrid
        const yMinIndex = Math.min(Math.max(0, (y1 * this.gridHeightI) | 0), this.gridRowCount) * this.cellYInGrid
        const yMaxIndex = Math.min(Math.max(0, Math.ceil(y2 * this.gridHeightI)), this.gridRowCount) * this.cellYInGrid

        session.setAlpha(alpha)
        session.setTransformMatrix(camera._matrixI)
        for (let i = 0, j = layers.length; i < j; i++) {
            this.renderLayer(session, layers[i], this.image, xMinIndex, xMaxIndex, yMinIndex, yMaxIndex)
        }
    }
    renderLayer(session, layer, texture, xMin, xMax, yMin, yMax) {
        const items = layer.items
        for (var i = yMin; i < yMax; i++) {
            const startIndex = i * layer.width
            for (var j = xMin; j < xMax; j++) {
                const cell = items[startIndex + j]
                if (cell) {
                    session.drawImage(texture,
                        cell[1], cell[2], cell[3], cell[4],
                        cell[5] - 1, cell[6] - 1, cell[3] + 2, cell[4] + 2
                    )
                }
            }
        }
    }
    updateCollision(camera, scene) {
        const xMinIndex = Math.min(Math.max(0, (camera.frame.x * this.gridWidthI) | 0), this.gridColumnCount) * this.cellXInGrid
        const xMaxIndex = Math.min(Math.max(0, Math.ceil(camera.frame.x2 * this.gridWidthI)), this.gridColumnCount) * this.cellXInGrid
        const yMinIndex = Math.min(Math.max(0, (camera.frame.y * this.gridHeightI) | 0), this.gridRowCount) * this.cellYInGrid
        const yMaxIndex = Math.min(Math.max(0, Math.ceil(camera.frame.y2 * this.gridHeightI)), this.gridRowCount) * this.cellYInGrid

        const children = scene.nodeTreeComponent.children //tileGridComponent.childrenInView
        const collideLayer = this.collideLayer
        this.collideNodes(children)

        for (let i = 0; i < children.length; i++) {
            this.collideNode(collideLayer, children[i], xMinIndex, xMaxIndex, yMinIndex, yMaxIndex)
        }
        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            child.stateComponent && child.stateComponent.integration()
        }
    }
    update() {

    }
    collideNodes(children) {
        const total = children.length
        let collideA
        let collideB
        for (var i = 0; i < total; i++) {
            collideA = children[i]
            if (!collideA || !collideA.stateComponent) {
                continue
            }
            for (var j = i + 1; j < total; j++) {
                collideB = children[j]
                if (!collideB || !collideB.stateComponent) {
                    continue
                }
                this.collideAB(collideA, collideB)
            }
        }
    }
    collideAB(nodeA, nodeB) {
        if (!nodeA.stateComponent || !nodeB.stateComponent || !nodeA.stateComponent.canCollideTo(nodeB.stateComponent)) {
            return
        }
        if (nodeA.spaceComponent.frame.collide(nodeB.spaceComponent.frame)) {
            this.pubsubComponent.pub('collision', nodeA, nodeB)
        }
    }
    collideNode(layer, node, xMinIndex, xMaxIndex, yMinIndex, yMaxIndex) {
        if (!node.graphicsComponent || node.graphicsComponent.notUseCamera || !node.stateComponent) {
            return
        }
        //地图与节点碰撞
        const items = layer.items
        const layerwidth = layer.width
        const layerheight = layer.height

        const tilewidth = layer.tilewidth
        const tileheight = layer.tileheight

        const velocity = node.stateComponent.velocity

        const vx = velocity.x
        const vy = velocity.y

        const frame = node.spaceComponent.frame

        this.collisionResolver.reset()

        //只处理节点的AABB与地图相交的地图块
        this.collideX(frame, vx, items, layer)
        this.collideY(frame, vx, vy, items, layer)

        velocity.add(this.collisionResolver)

        node.stateComponent.handle(this.collisionResolver.x, vx, this.collisionResolver.y, vy)
    }
    collideX(frame, vx, items, layer) {
        const layerwidth = layer.width
        const layerheight = layer.height

        const tilewidth = layer.tilewidth
        const tileheight = layer.tileheight

        const frameXMin = frame.x + vx
        const frameXMax = frame.x2 + vx
        const frameYMin = frame.y
        const frameYMax = frame.y2

        const frameXMinIndex = Math.min(Math.max(0, (frameXMin / tilewidth) | 0), layerwidth)
        const frameXMaxIndex = Math.min(Math.max(0, Math.ceil(frameXMax / tilewidth)), layerwidth)
        const frameYMinIndex = Math.min(Math.max(0, (frameYMin / tileheight) | 0), layerheight)
        const frameYMaxIndex = Math.min(Math.max(0, Math.ceil(frameYMax / tileheight)), layerheight)

        const vxAbs = Math.abs(vx)
        const signX = vx >= 0 ? 1 : -1

        const collisionResolver = this.collisionResolver
        let xMinLoopIndex
        let yMinLoopIndex = frameYMinIndex
        let startIndex
        outer:
            while (yMinLoopIndex <= frameYMaxIndex) {
                startIndex = yMinLoopIndex * layerwidth
                xMinLoopIndex = frameXMinIndex
                inner:
                    while (xMinLoopIndex <= frameXMaxIndex) {
                        if (collisionResolver.canBreak) {
                            break outer
                        }
                        if (collisionResolver.canContinue) {
                            continue
                        }
                        this.resolveGridX(
                            items[startIndex + xMinLoopIndex],
                            vxAbs,
                            signX,
                            frameXMin,
                            frameXMax,
                            frameYMin,
                            frameYMax
                        )
                        xMinLoopIndex++
                    }
                yMinLoopIndex++
            }
    }
    collideY(frame, vx, vy, items, layer) {
        const layerwidth = layer.width
        const layerheight = layer.height

        const tilewidth = layer.tilewidth
        const tileheight = layer.tileheight

        vx += this.collisionResolver.x
        const frameXMin = frame.x + vx
        const frameXMax = frame.x2 + vx
        const frameYMin = frame.y + vy
        const frameYMax = frame.y2 + vy

        const frameXMinIndex = Math.min(Math.max(0, (frameXMin / tilewidth) | 0), layerwidth)
        const frameXMaxIndex = Math.min(Math.max(0, Math.ceil(frameXMax / tilewidth)), layerwidth)
        const frameYMinIndex = Math.min(Math.max(0, (frameYMin / tileheight) | 0), layerheight)
        const frameYMaxIndex = Math.min(Math.max(0, Math.ceil(frameYMax / tileheight)), layerheight)

        const vyAbs = Math.abs(vy)
        const signY = vy >= 0 ? 1 : -1

        let xMinLoopIndex
        let yMinLoopIndex = frameYMinIndex
        let startIndex
        const collisionResolver = this.collisionResolver
        outer:
            while (yMinLoopIndex <= frameYMaxIndex) {
                startIndex = yMinLoopIndex * layerwidth
                xMinLoopIndex = frameXMinIndex
                inner:
                    while (xMinLoopIndex <= frameXMaxIndex) {
                        if (collisionResolver.canBreak) {
                            break outer
                        }
                        if (collisionResolver.canContinue) {
                            continue
                        }

                        this.resolveGridY(
                            items[startIndex + xMinLoopIndex],
                            vyAbs,
                            signY,
                            frameXMin,
                            frameXMax,
                            frameYMin,
                            frameYMax
                        )
                        xMinLoopIndex++
                    }
                yMinLoopIndex++
            }
    }
    skipGridX(gid) {
        return false
    }
    skipGridY(gid) {
        return false
    }
    resolveGridX(
        cell, vxAbs, signX,
        frameXMin,
        frameXMax,
        frameYMin,
        frameYMax
    ) {
        const collisionResolver = this.collisionResolver
        if (cell) {
            const gid = cell[0]
            if (!this.skipGridX(gid)) {
                const cellX = cell[5]
                const cellY = cell[6]
                const width = cell[3]
                const height = cell[4]
                if (!(
                        cellX >= frameXMax ||
                        cellY >= frameYMax ||
                        (cellX + width) <= frameXMin ||
                        (cellY + height) <= frameYMin
                    )) {
                    const temp = signX > 0 ? Math.max(collisionResolver.x, frameXMax - cellX) : Math.max(cellX + width - frameXMin, collisionResolver.x)
                    if (temp <= vxAbs) {
                        collisionResolver.x = signX > 0 ? -temp : temp
                    }
                }
            }
        }
    }
    resolveGridY(
        cell, vyAbs, signY,
        frameXMin,
        frameXMax,
        frameYMin,
        frameYMax
    ) {
        if (!cell) {
            return
        }
        const gid = cell[0]
        if (!this.skipGridY(gid)) {
            this.handleGridY(
                gid, cell, signY, vyAbs,
                frameXMin,
                frameXMax,
                frameYMin,
                frameYMax
            )
        }
    }
    handleGridY(gid, cell, signY, vyAbs, x1, x2, y1, y2) {
        const collisionResolver = this.collisionResolver
        const cellX = cell[5]
        const cellY = cell[6]
        const width = cell[3]
        const height = cell[4]
        if (!(
                cellX >= x2 ||
                cellY >= y2 ||
                (cellX + width) <= x1 ||
                (cellY + height) <= y1
            )) {
            const temp = signY > 0 ? Math.max(collisionResolver.y, y2 - cellY) : Math.max(cellY + height - y1, collisionResolver.y)
            if (temp <= vyAbs) {
                collisionResolver.y = signY > 0 ? -temp : temp
            }
        }
    }
    remove() {
        this.pubsubComponent.remove()
        this.collisionResolver.remove()
        this.pubsubComponent =
            this.collisionResolver =
            this.json =
            this.layers =
            this.image =
            this.imageUrl =
            this.collideLayer = null
        TiledMapComponent.collect(this)
    }
}

const caches = []
TiledMapComponent.create = function(json, cellXInGrid, cellYInGrid) {
    return (caches.length ? caches.pop() : new TiledMapComponent).init(json, cellXInGrid, cellYInGrid)
}
TiledMapComponent.collect = function(component) {
    caches.push(component)
}
TiledMapComponent.clean = function() {
    caches.length = 0
}

export default TiledMapComponent