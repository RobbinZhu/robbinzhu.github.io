class Frame {
    constructor() {}
    update(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.x2 = x + width
        this.y2 = y + height
        this.centerX = x + width * 0.5
        this.centerY = y + width * 0.5
        return this
    }
    updateTo(frame) {
        this.x = frame.x
        this.y = frame.y
        this.width = frame.width
        this.height = frame.height
    }
    compute(x, y, w, h, cx, cy, sin, cos, sx, sy) {
        /* 旋转Matrix
        |cos  -sin|
        |sin   cos|

        缩放
        |sx  0|
        |0  sy|

        最终matrix
        |cos.sx  -sin.sy|
        |sin.sx  cos.sy |*/

        x -= cx
        y -= cy

        const a = cos * sx,
            b = sin * sx,
            c = -sin * sy,
            d = cos * sy,

            TopLeftX = x * a + y * b,
            TopLeftY = x * c + y * d,
            TopRightX = (x + w) * a + y * b,
            TopRightY = (x + w) * c + y * d,
            BottomLeftX = x * a + (y + h) * b,
            BottomLeftY = x * c + (y + h) * d,
            BottomRightX = (x + w) * a + (y + h) * b,
            BottomRightY = (x + w) * c + (y + h) * d,

            xMin = Math.min(TopLeftX, TopRightX, BottomLeftX, BottomRightX),
            xMax = Math.max(TopLeftX, TopRightX, BottomLeftX, BottomRightX),
            yMin = Math.min(TopLeftY, TopRightY, BottomLeftY, BottomRightY),
            yMax = Math.max(TopLeftY, TopRightY, BottomLeftY, BottomRightY)

        this.x = xMin + cx
        this.y = yMin + cy
        this.x2 = xMax + cx
        this.y2 = yMax + cy
        this.width = xMax - xMin
        this.height = yMax - yMin
        this.centerX = (xMin + xMax) * 0.5
        this.centerY = (yMin + yMax) * 0.5
    }
    computeWithMatrix(width, height, matrix) {
        const x1 = matrix.e
        const y1 = matrix.f

        const x2 = matrix.a * width + x1
        const y2 = matrix.b * width + y1

        const x3 = matrix.a * width + matrix.c * height + x1
        const y3 = matrix.b * width + matrix.d * height + y1

        const x4 = matrix.c * height + x1
        const y4 = matrix.d * height + y1

        const xMin = Math.min(x1, x2, x3, x4)
        const xMax = Math.max(x1, x2, x3, x4)
        const yMin = Math.min(y1, y2, y3, y4)
        const yMax = Math.max(y1, y2, y3, y4)

        this.x = xMin
        this.y = yMin
        this.x2 = xMax
        this.y2 = yMax
        this.width = xMax - xMin
        this.height = yMax - yMin
        this.centerX = (xMin + xMax) * 0.5
        this.centerY = (yMin + yMax) * 0.5
    }
    collide(to) {
        if (
            to.x > this.x2 ||
            to.y > this.y2 ||
            to.x2 < this.x ||
            to.y2 < this.y
        ) {
            return false
        }
        return true
    }
    collideTo(x, y, x2, y2) {
        if (
            x > this.x2 ||
            y > this.y2 ||
            x2 < this.x ||
            y2 < this.y
        ) {
            return false
        }
        return true
    }
    contains(x, y) {
        return this.x <= x && x <= this.x2 && this.y <= y && y <= this.y2
    }
    remove() {
        Frame.collect(this)
    }
}

const caches = []

Frame.create = function(x, y, width, height) {
    return (caches.length ? caches.pop() : new Frame).update(x, y, width, height)
}

Frame.collect = function(frame) {
    caches.push(frame)
}

Frame.clean = function(frame) {
    caches.length = 0
}
export default Frame