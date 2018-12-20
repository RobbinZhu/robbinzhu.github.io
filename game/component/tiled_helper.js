import Vector from '../common/vector.js'

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
