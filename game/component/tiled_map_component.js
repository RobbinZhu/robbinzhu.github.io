import ImageLoader from '../common/image_loader.js'
import GridWorldComponent from './grid_world_component.js'
import CollisionHandler from './collision.js'
class TiledMapComponent {
    constructor() {}

    init(json, cellXInGrid, cellYInGrid) {
        this.name = 'tiledmap'
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
            // this.gridWorldComponent = GridWorldComponent.create(json.tilewidth * json.width, json.tileheight * json.height, json.tilewidth, json.tileheight)
        this.init = false
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
                    const grids = []
                    const layerData = {
                        tilewidth: tilewidth,
                        tileheight: tileheight,
                        gridRowCount: Math.ceil(layer.height / tileCountYInGrid),
                        gridColumnCount: Math.ceil(layer.width / tileCountXInGrid),
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

                        grids: grids
                    }

                    layers.push(layerData)
                    const data = layer.data
                    let x = 0,
                        y = 0
                    for (let i = 0, j = data.length; i < j; i++) {
                        let gid = data[i]

                        //行
                        const row = (i / layerwidth) | 0

                        //列
                        const column = i % layerwidth

                        //grid中的列
                        const gridColumnNumber = (column / tileCountXInGrid) | 0

                        const gridRowNumber = (row / tileCountYInGrid) | 0

                        const gridRow = grids[gridRowNumber] = (grids[gridRowNumber] || [])

                        const gridColumn = gridRow[gridColumnNumber] = gridRow[gridColumnNumber] || []

                        const cellRowNumber = row % tileCountYInGrid
                        const cellColumnNumber = column % tileCountXInGrid
                        const cellRow = gridColumn[cellRowNumber] = gridColumn[cellRowNumber] || []
                        cellRow[cellColumnNumber] = null
                        if (gid > 0) {
                            gid -= firstgid
                            cellRow[cellColumnNumber] = [
                                gid, //x, y,
                                (gid % countX) * tileset.tilewidth - tileoffset.x, ((gid * countXI) | 0) * tileset.tileheight + tileoffset.y,
                                tilewidth, tileheight,
                                x * tilewidth, y * tileheight
                            ]
                        }
                        if (++x == layerwidth) {
                            x = 0
                            y++
                        }
                    }
                    break
                case 'objectgroup':
                    /*
                    for (let i = 0, j = layer.objects.length; i < j; i++) {
                        const object = layer.objects[i]
                        const gid = object.gid
                        if (gid > 0) {
                            continue
                        }
                    }*/
                    console.log('objectgroup not support')
                    break
            }
        }
        return layers
    }
    render(session, camera) {
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
        let x1 = camera.frame.x,
            y1 = camera.frame.y,
            x2 = camera.frame.x2,
            y2 = camera.frame.y2

        const matrix = camera._matrixI
        session.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f)
        for (let i = 0, j = layers.length; i < j; i++) {
            this.renderLayer(session, layers[i], x1, x2, y1, y2)
        }
    }
    renderLayer(session, layer, xMin, xMax, yMin, yMax) {
        const grids = layer.grids
        const gridWidth = layer.gridWidth
        const gridHeight = layer.gridHeight

        const texture = this.image

        const xMinIndex = Math.max(0, (xMin * layer.gridWidthI) | 0)
        const xMaxIndex = Math.max(0, (xMax * layer.gridWidthI) | 0)
        let yMinIndex = Math.max(0, (yMin * layer.gridHeightI) | 0)
        const yMaxIndex = Math.max(0, (yMax * layer.gridHeightI) | 0)

        while (yMinIndex < grids.length) {
            if (yMinIndex > yMaxIndex) {
                break
            }
            this.renderRow(session, grids[yMinIndex], gridWidth, xMinIndex, xMaxIndex, texture)
            yMinIndex++
        }
    }
    renderRow(session, gridsRow, gridWidth, xMinIndex, xMaxIndex, texture) {
        while (xMinIndex < gridsRow.length) {
            if (xMinIndex > xMaxIndex) {
                break
            }
            this.renderGrid(session, gridsRow[xMinIndex], texture)
            xMinIndex++
        }
    }
    drawGridCell(session, cell, texture) {
        if (cell) {
            session.drawImage(texture,
                cell[1], cell[2], cell[3], cell[4],
                cell[5] - 1, cell[6] - 1, cell[3] + 2, cell[4] + 2
            )
        }
    }
    renderGrid(session, grid, texture) {
        let line
        for (let i = 0; i < grid.length; i++) {
            line = grid[i]
            for (let j = 0; j < line.length; j++) {
                this.drawGridCell(session, line[j], texture)
            }
        }
    }
    handleCollision(camera, gridWorld) {
        if (!camera) {
            return
        }
        const frame = camera.frame
        const layer = this.collideLayer
        const grids = layer.grids

        let xMin = frame.x,
            yMin = frame.y,
            xMax = frame.x2,
            yMax = frame.y2

        const xMinIndex = Math.min(Math.max(0, (xMin * layer.gridWidthI) | 0), layer.gridColumnCount)
        const xMaxIndex = Math.min(Math.max(0, (xMax * layer.gridWidthI) | 0), layer.gridColumnCount)
        const yMinIndex = Math.min(Math.max(0, (yMin * layer.gridHeightI) | 0), layer.gridRowCount)
        const yMaxIndex = Math.min(Math.max(0, (yMax * layer.gridHeightI) | 0), layer.gridRowCount)

        const gridWidth = layer.gridWidth
        const gridHeight = layer.gridHeight
        /*
        for (var i = yMinIndex; i < yMaxIndex; i++) {
            for (var j = xMinIndex; j < xMaxIndex; j++) {
                let header = gridWorld.grids[i][j].header
                while (header) {
                    this.collideX(grids, xMinIndex, xMaxIndex, yMinIndex, yMaxIndex, header.node, gridWidth, gridHeight)
                    header = header._next
                }
            }
        }
        */
        for (var i = yMinIndex; i < yMaxIndex; i++) {
            for (var j = xMinIndex; j < xMaxIndex; j++) {
                let header = gridWorld.grids[i][j].header
                while (header) {
                    this.collideY(grids, xMinIndex, xMaxIndex, yMinIndex, yMaxIndex, header.node, gridWidth, gridHeight)
                    header = header._next
                }
            }
        }
        /*
        for (var i = 0; i < nodes.length; i++) {
            this.collide(gridWorld, xMinIndex, xMaxIndex, yMinIndex, yMaxIndex, nodes[i].host, gridWidth, gridHeight)
        }*/
    }
    collideX(tileMap, xMinIndex, xMaxIndex, yMinIndex, yMaxIndex, node, gridWidth, gridHeight) {
        let xMin = xMinIndex * gridWidth
        let yMin = yMinIndex * gridHeight

        const frame = node.spaceComponent.frame
        const velocity = node.physicsComponent.velocity
        const velocityCorrection = node.physicsComponent.velocityCorrection
        const signX = velocity.x >= 0 ? 1 : -1

        let frameXMin = frame.x + velocity.x,
            frameYMin = frame.y,
            frameXMax = frame.x2 + velocity.x,
            frameYMax = frame.y2

        let resolveX = 0
        const vxAbs = Math.abs(node.physicsComponent.velocity.x)
        while (xMinIndex < xMaxIndex) {
            if (xMin > frameXMax) {
                break
            }
            while (yMinIndex < yMaxIndex) {
                if (yMin > frameYMax) {
                    break
                }
                const tilemapGrid = tileMap[yMinIndex][xMinIndex]

                for (var i = 0; i < 6; i++) {
                    for (var j = 0; j < 6; j++) {
                        const cell = tilemapGrid[i][j]
                        if (cell) {
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

                                const temp = signX > 0 ? Math.max(resolveX, frameXMax - cellX) : Math.max(cellX + width - frameXMin, resolveX)
                                if (temp <= vxAbs) {
                                    resolveX = signX > 0 ? -temp : temp
                                }
                            }
                        }
                    }
                }
                yMinIndex++
                yMin += gridHeight
            }
            xMinIndex++
            xMin += gridWidth
        }
        if (resolveX) {
            // velocityCorrection.x = velocity.x + resolveX
            velocity.x += resolveX
        }
    }
    collideY(tileMap, xMinIndex, xMaxIndex, yMinIndex, yMaxIndex, node, gridWidth, gridHeight) {
        let xMin = xMinIndex * gridWidth
        let yMin = yMinIndex * gridHeight

        const frame = node.spaceComponent.frame
        const velocity = node.physicsComponent.velocity
        const signY = velocity.y >= 0 ? 1 : -1

        let frameXMin = frame.x,
            frameYMin = frame.y,
            frameXMax = frame.x2,
            frameYMax = frame.y2

        let resolveY = 0
        const vyAbs = Math.abs(node.physicsComponent.velocity.y)
        while (xMinIndex < xMaxIndex) {
            if (xMin > frameXMax) {
                break
            }
            while (yMinIndex < yMaxIndex) {
                if (yMin > frameYMax) {
                    break
                }
                const tilemapGrid = tileMap[yMinIndex][xMinIndex]

                for (var i = 0; i < 6; i++) {
                    for (var j = 0; j < 6; j++) {
                        const cell = tilemapGrid[i][j]
                        if (cell) {
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

                                const temp = signY > 0 ? Math.max(resolveY, frameYMax - cellY) : Math.max(cellY + height - frameYMin, resolveY)
                                if (temp <= vyAbs) {
                                    resolveY = signY > 0 ? -temp : temp
                                }
                            }
                        }
                    }
                }
                yMinIndex++
                yMin += gridHeight
            }
            xMinIndex++
            xMin += gridWidth
        }
        if (resolveY) {
            // velocityCorrection.x = velocity.x + resolveX
            velocity.y += resolveY
        }

    }
    collide2(grid, xMinIndex, xMaxIndex, yMinIndex, yMaxIndex, node, gridWidth, gridHeight) {
        let xMin = xMinIndex * gridWidth
        let yMin = yMinIndex * gridHeight

        const frame = node.spaceComponent.frame
        let frameXMin = frame.x,
            frameYMin = frame.y,
            frameXMax = frame.x2,
            frameYMax = frame.y2

        while (xMinIndex < xMaxIndex) {
            if (xMin > frameXMax) {
                break
            }
            while (yMinIndex < yMaxIndex) {
                if (yMin > frameYMax) {
                    break
                }
                const grid = grids[yMinIndex][xMinIndex]

                for (var i = 0; i < 6; i++) {
                    for (var j = 0; j < 6; j++) {
                        const cell = grid[i][j]
                        if (cell) {
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
                                debugger
                            }
                        }
                    }
                }
                yMinIndex++
                yMin += gridHeight
            }
            xMinIndex++
            xMin += gridWidth
        }
    }
    remove() {
        this.gridWorldComponent.remove()
        this.gridWorldComponent =
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