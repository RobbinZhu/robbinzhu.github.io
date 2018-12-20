import TiledComponent from '../component/tiled_component.js'

import Vector from '../common/vector.js'
import Ajax from '../common/ajax.js'
const gidToSlopeIndex = {
    51: 0,
    52: 1,
    61: 2,
    62: 3,

    53: 4,
    54: 5,
    55: 6,
    56: 7,
    63: 8,
    64: 9,
    65: 10,
    66: 11,
    94: 1,
    97: 0
}

const triangleSlopePoint = [
    Vector.create(0, 64),
    Vector.create(0, 0),
    Vector.create(0, 0),
    Vector.create(0, 64),

    Vector.create(0, 64),
    Vector.create(0, 32),
    Vector.create(0, 0),
    Vector.create(0, 32),
    Vector.create(0, 0),
    Vector.create(0, 32),
    Vector.create(0, 64),
    Vector.create(0, 32)
]

const normals = [
    Vector.create(-1 / Math.sqrt(2), -1 / Math.sqrt(2)),
    Vector.create(1 / Math.sqrt(2), -1 / Math.sqrt(2)),
    Vector.create(-1 / Math.sqrt(2), 1 / Math.sqrt(2)),
    Vector.create(1 / Math.sqrt(2), 1 / Math.sqrt(2)),

    Vector.create(-0.5 / Math.sqrt(1.25), -1 / Math.sqrt(1.25)),
    Vector.create(-0.5 / Math.sqrt(1.25), -1 / Math.sqrt(1.25)),

    Vector.create(0.5 / Math.sqrt(1.25), -1 / Math.sqrt(1.25)),
    Vector.create(0.5 / Math.sqrt(1.25), -1 / Math.sqrt(1.25)),

    Vector.create(-0.5 / Math.sqrt(1.25), 1 / Math.sqrt(1.25)),
    Vector.create(-0.5 / Math.sqrt(1.25), 1 / Math.sqrt(1.25)),

    Vector.create(0.5 / Math.sqrt(1.25), 1 / Math.sqrt(1.25)),
    Vector.create(0.5 / Math.sqrt(1.25), 1 / Math.sqrt(1.25))
]

function collideSlopeWithRect(index, x1, y1, x2, y2, desX, desY) {
    switch (index) {
        case 0:
        case 5:
            if (x1 <= (desX + 64) && (desX + 64) <= x2 &&
                y1 <= desY && desY <= y2) {
                return -y2 + desY
            }
            break
        case 1:
        case 6:
            if (x1 <= desX && desX <= x2 && y1 <= desY && desY <= y2) {
                return -y2 + desY
            }
            break
        case 2:
        case 9:
            if (x1 <= (desX + 64) && (desX + 64) <= x2 && y1 <= (desY + 64) && (desY + 64) <= y2) {
                return desY + 64 - y1
            }
            break
        case 3:
        case 10:
            if (x1 <= desX && desX <= x2 && y1 <= (desY + 64) && (desY + 64) <= y2) {
                return desY + 64 - y1
            }
            break
        case 4:
            if (x1 <= (desX + 64) && (desX + 64) <= x2 &&
                y1 <= (desY + 32) && (desY + 32) <= y2) {
                return -y2 + desY + 32
            }
            break
        case 7:
            if (x1 <= desX && desX <= x2 && y1 <= (desY + 32) && (desY + 32) <= y2) {
                return -y2 + desY + 32
            }
            break
        case 8:
            if (x1 <= (desX + 64) && (desX + 64) <= x2 && y1 <= (desY + 32) && (desY + 32) <= y2) {
                return desY + 32 - y1
            }
            break
        case 11:
            if (x1 <= desX && desX <= x2 && y1 <= (desY + 32) && (desY + 32) <= y2) {
                return desY + 32 - y1
            }
            break
        default:
            break
    }
}

function isSand(gid) {
    return false //gid == 82
}

function isJumpThroughPlane(gid) {
    return gid == 92
}

function isSlope(gid) {
    return gidToSlopeIndex[gid] !== undefined
}

function skipGridX(gid) {
    return isSand(gid) || isJumpThroughPlane(gid) || isSlope(gid)
}

class Tiled extends TiledComponent {
    constructor() {
        super()
    }
    skipGridX(gid) {
        return isSand(gid) || isJumpThroughPlane(gid) || isSlope(gid)
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
            if (isJumpThroughPlane(gid)) {
                const vy = signY * vyAbs
                if (vy > 0 && (y2 - vy) <= cellY && y2 >= cellY) {
                    collisionResolver.y = -y2 + cellY
                    collisionResolver.canBreak = true
                }
            } else if (isSlope(gid)) {
                const slopeIndex = gidToSlopeIndex[gid]

                const resolveDistance = collideSlopeWithRect(slopeIndex, x1, y1, x2, y2, cellX, cellY)
                if (resolveDistance !== undefined) {
                    collisionResolver.y = resolveDistance
                    return
                }
                const normal = normals[slopeIndex]
                const widthDot = (x2 - x1) * normal.x
                const heightDot = (y2 - y1) * normal.y

                //矩形的几个顶点，映射到三角形斜边的垂线上，得到四个值
                const n1 = x1 * normal.x + y1 * normal.y // a.dot(normal)
                const n2 = n1 + widthDot
                const n3 = n2 + heightDot
                const n4 = n1 + heightDot

                // console.log(n1, n2, n3, n4)

                const min = Math.min(n1, n2, n3, n4)
                const max = Math.max(n1, n2, n3, n4)

                //三角形顶点
                const pa = Vector.create(cellX, cellY).add(triangleSlopePoint[slopeIndex])
                const pDot = pa.dot(normal)
                pa.remove()

                //如果三角形顶点的映射在矩形映射的区间之内，则相交
                if (min <= pDot && pDot <= max) {
                    collisionResolver.y = (normal.y > 0 ? 1 : -1) * Math.round(pDot - min)
                    collisionResolver.canBreak = true
                }
            } else {
                super.handleGridY(gid, cell, signY, vyAbs, x1, x2, y1, y2)
            }
        }
    }
}

const caches = []
Tiled.init = function(file, fn) {
    Ajax.get(file, function(json) {
        fn(Tiled.create(json, 6, 6))
    })
}
Tiled.create = function(json, cellXInGrid, cellYInGrid) {
    return (caches.length ? caches.pop() : new Tiled).init(json, cellXInGrid, cellYInGrid)
}
Tiled.collect = function(component) {
    caches.push(component)
}
Tiled.clean = function() {
    caches.length = 0
}

export default Tiled