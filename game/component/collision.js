import Vector from '../common/vector.js'

function resolveXCollision(vx, items, vxAbs, x1, y1, x2, y2) {
    let resolveX = 0
    if (vx != 0) {
        const sign = vx > 0 ? 1 : -1
        for (let a = 0, b = items.length; a < b;) {
            const image = items[a++],
                gid = items[a++],
                x = items[a++],
                y = items[a++],
                sourceX = items[a++],
                sourceY = items[a++],
                sourceWidth = items[a++],
                sourceHeight = items[a++],
                desX = items[a++],
                desY = items[a++],
                destWidth = items[a++],
                destHeight = items[a++]
            if (getIndex(gid) >= 0) {
                continue
            }
            if (isSand(gid) || isPlane(gid)) {
                continue
            }
            if (!(
                    desX >= x2 ||
                    desY >= y2 ||
                    (desX + destWidth) <= x1 ||
                    (desY + destHeight) <= y1
                )) {
                const temp = sign > 0 ? Math.max(resolveX, x2 - desX) : Math.max(desX + destWidth - x1, resolveX)
                if (temp <= vxAbs) {
                    resolveX = sign > 0 ? -temp : temp
                }
            }
        }
    }
    return resolveX
}

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

function getIndex(gid) {
    switch (gid) {
        case 51:
            return 0
            break
        case 52:
            return 1
            break
        case 61:
            return 2
            break
        case 62:
            return 3
            break
        case 53:
            return 4
            break
        case 54:
            return 5
            break
        case 55:
            return 6
            break
        case 56:
            return 7
            break
        case 63:
            return 8
            break
        case 64:
            return 9
            break
        case 65:
            return 10
            break
        case 66:
            return 11
            break
        default:
            return -1
    }
}

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
    return -1
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

function isSpecialSlope(gidSlopeIndex) {
    return gidSlopeIndex == 4 || gidSlopeIndex == 8
}

function isSand(gid) {
    return false //gid == 82
}

function isPlane(gid) {
    return gid == 92
}

function resolveYCollision(vy, items, vyAbs, x1, y1, x2, y2, obj) {
    // obj.touchWater = false
    let isSlope = false
    let resolveY = 0
    if (vy != 0) {
        const sign = vy > 0 ? 1 : -1
        for (let a = 0, b = items.length; a < b;) {
            const image = items[a++],
                gid = items[a++],
                x = items[a++],
                y = items[a++],
                sourceX = items[a++],
                sourceY = items[a++],
                sourceWidth = items[a++],
                sourceHeight = items[a++],
                desX = items[a++],
                desY = items[a++],
                destWidth = items[a++],
                destHeight = items[a++]
            if (!(
                    desX >= x2 ||
                    desY >= y2 ||
                    (desX + destWidth) <= x1 ||
                    (desY + destHeight) <= y1
                )) {
                const gidSlopeIndex = getIndex(gid)
                if (gidSlopeIndex >= 0) {
                    const resolveDistance = collideSlopeWithRect(gidSlopeIndex, x1, y1, x2, y2, desX, desY)
                    if (resolveDistance != -1) {
                        resolveY = resolveDistance
                        isSlope = true
                        if (isSpecialSlope(gidSlopeIndex)) {
                            continue
                        }
                        break
                    }

                    const normal = normals[gidSlopeIndex]

                    const widthDot = (x2 - x1) * normal.x
                    const heightDot = (y2 - y1) * normal.y

                    const n1 = x1 * normal.x + y1 * normal.y // a.dot(normal)
                    const n2 = n1 + widthDot
                    const n3 = n2 + heightDot
                    const n4 = n1 + heightDot
                        // console.log(n1, n2, n3, n4)

                    const min = Math.min(n1, n2, n3, n4)
                    const max = Math.max(n1, n2, n3, n4)

                    const pa = Vector.create(desX, desY).add(triangleSlopePoint[gidSlopeIndex])
                    const pDot = pa.dot(normal)
                    pa.remove()
                    if (min <= pDot && pDot <= max) {
                        resolveY = (normal.y > 0 ? 1 : -1) * Math.round(pDot - min)
                        isSlope = true
                        break
                    }
                    continue
                } else {
                    //is not slope
                    if (isPlane(gid)) {
                        if (vy > 0 && (y2 - vy) <= desY && y2 >= desY) {
                            resolveY = y2 - desY
                            break
                        }
                        continue
                    }
                    if (sign > 0) {
                        const temp = Math.max(y2 - desY, resolveY)
                        if (isSand(gid)) {
                            // obj.touchWater = true
                            resolveY = (temp * 0.05) | 0
                            break
                        }
                        if (temp <= vyAbs) {
                            resolveY = temp
                        }
                    } else {
                        const temp = Math.max(desY + destHeight - y1, resolveY)
                        if (isSand(gid)) {
                            resolveY = 0
                            break
                        }
                        if (temp <= vyAbs) {
                            resolveY = temp
                        }
                    }
                }
            }
        }
        if (!isSlope) {
            resolveY *= -sign
        }
    }
    if (isSlope) {
        // console.log(resolveY)
    }
    return resolveY | 0
}

export default function(collideLayer, stateNode) {
    if (!collideLayer) {
        return
    }
    const node = stateNode.host
    const space = node.spaceComponent

    const myWidth = space.width
    const myHeight = space.height
    const ax = myWidth * space.anchor.x
    const ay = myHeight * space.anchor.y
    const tx = space.position.x
    const ty = space.position.y
    const vx = stateNode.velocity.x
    const vy = stateNode.velocity.y

    const vxAbs = Math.abs(vx)
    const vyAbs = Math.abs(vy)
    let x1 = tx - ax + vx,
        y1 = ty - ay,
        x2 = x1 + myWidth,
        y2 = y1 + myHeight

    const items = collideLayer.items

    let resolveX = resolveXCollision(vx, items, vxAbs, x1, y1, x2, y2)
    x1 = tx - ax + vx + resolveX
    y1 = ty - ay + vy
    x2 = x1 + myWidth
    y2 = y1 + myHeight

    let resolveY = resolveYCollision(vy, items, vyAbs, x1, y1, x2, y2)

    physicsNode.handle(resolveX, vx, resolveY, vy)
}