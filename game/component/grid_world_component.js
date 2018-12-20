import GridComponent from './grid_component.js'

class GridWorldComponent {
    constructor() {}
    init(width, height, gridWidth, gridHeight) {
        this.width = width
        this.height = height
        this.gridWidth = gridWidth
        this.gridHeight = gridHeight
        this.gridWidthI = 1 / gridWidth
        this.gridHeightI = 1 / gridHeight

        const grids = []
        const totalNumberX = Math.ceil(width / gridWidth)
        const totalNumberY = Math.ceil(height / gridHeight)
        for (let i = 0; i < totalNumberY; i++) {
            const line = []
            for (let j = 0; j < totalNumberX; j++) {
                line.push(GridComponent.create())
            }
            grids.push(line)
        }
        this.grids = grids
        this.totalNumberX = totalNumberX
        this.totalNumberY = totalNumberY
        return this
    }
    addNode(node) {
        node.addUnitSupport()
        this.addUnit(node.unitComponent)
    }
    addUnit(unit) {
        unit.setWorld(this)
        const frame = unit.node.spaceComponent.frame

        //always add unit to cell's header
        const xIndex = Math.min(this.totalNumberX - 1, Math.max(0, (frame.x * this.gridWidthI) | 0))
        const yIndex = Math.min(this.totalNumberY - 1, Math.max(0, (frame.y * this.gridHeightI) | 0))
        const grid = this.grids[yIndex][xIndex]
        const existedHeader = grid.header
        unit._prev = null
        unit._next = existedHeader

        unit.cellXIndex = xIndex
        unit.cellYIndex = yIndex

        grid.header = unit
        if (existedHeader) {
            existedHeader._prev = unit
        }
    }
    updateUnit(unit) {
        const frame = unit.node.spaceComponent.frame
        const xIndex = Math.min(this.totalNumberX - 1, Math.max(0, (frame.x * this.gridWidthI) | 0))
        const yIndex = Math.min(this.totalNumberY - 1, Math.max(0, (frame.y * this.gridHeightI) | 0))
        if (xIndex == unit.cellXIndex && yIndex == unit.cellYIndex) {
            return
        }
        this.moveUnitTo(unit, xIndex, yIndex)
    }
    moveUnitTo(unit, newXIndex, newYIndex) {

        // 将它从老网格的列表中移除
        if (unit._prev) {
            unit._prev._next = unit._next
        }

        if (unit._next) {
            unit._next._prev = unit._prev
        }

        // 如果它是列表的头，移除它

        const existedHeader = this.grids[unit.cellXIndex][unit.cellYIndex]

        if (existedHeader === unit) {
            this.grids[unit.cellXIndex][unit.cellYIndex] = unit._next
        }

        // 加到新网格的对象列表末尾
        this.addUnit(unit)
    }
    removeUnit(unit) {
        const prev = unit._prev
        if (prev) {
            prev._next = unit._next
        }
        unit.remove()
        const grid = this.grids[unit.cellXIndex][unit.cellYIndex]
        if (grid.header === unit) {
            grid.header = null
        }
    }
    update(session, camera) {
        const frame = camera.frame
        const xMinIndex = Math.min(Math.max(0, (frame.x * this.gridWidthI) | 0), this.totalNumberX - 1)
        const xMaxIndex = Math.min(Math.max(0, (frame.x2 * this.gridWidthI) | 0), this.totalNumberX - 1)
        const yMinIndex = Math.min(Math.max(0, (frame.y * this.gridHeightI) | 0), this.totalNumberY - 1)
        const yMaxIndex = Math.min(Math.max(0, (frame.y2 * this.gridHeightI) | 0), this.totalNumberY - 1)
        this.collide(this.grids, xMinIndex, xMaxIndex, yMinIndex, yMaxIndex)
        this.updatePositions(this.grids, xMinIndex, xMaxIndex, yMinIndex, yMaxIndex)
    }
    collide(grids, xMinIndex, xMaxIndex, yMinIndex, yMaxIndex) {
        while (yMinIndex <= yMaxIndex) {
            while (xMinIndex <= xMaxIndex) {
                // grids[yMinIndex][xMinIndex].update(session, camera)
                xMinIndex++
            }
            yMinIndex++
        }
    }
    updatePositions(grids, xMinIndex, xMaxIndex, yMinIndex, yMaxIndex) {
        while (yMinIndex <= yMaxIndex) {
            while (xMinIndex <= xMaxIndex) {
                grids[yMinIndex][xMinIndex].updatePosition()
                xMinIndex++
            }
            yMinIndex++
        }
    }
    remove() {
        const totalNumberX = this.totalNumberX
        const totalNumberY = this.totalNumberY
        let grids = this.grids
        for (let i = 0; i < totalNumberY; i++) {
            const line = grids[i]
            for (let j = 0; j < totalNumberX; j++) {
                const unit = line[j]
                if (unit) {
                    unit.removeCascade()
                }
            }
        }
        this.grids = null
        GridWorldComponent.collect(this)
    }
}

const caches = []
GridWorldComponent.create = function(width, height, gridWidth, gridHeight) {
    return (caches.length ? caches.pop() : new GridWorldComponent).init(width, height, gridWidth, gridHeight)
}
GridWorldComponent.collect = function(gridWorld) {
    caches.push(gridWorld)
}
GridWorldComponent.clean = function() {
    caches.length = 0
}

export default GridWorldComponent