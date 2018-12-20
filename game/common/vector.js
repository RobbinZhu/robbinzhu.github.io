class Vector {
    init(x, y) {
        return this.update(x, y)
    }
    clone() {
        return Vector.create(this.x, this.y)
    }
    update(x, y) {
        this.x = x
        this.y = y
        return this
    }
    set(to) {
        this.x = to.x
        this.y = to.y
        return this
    }
    negate() {
        this.x = -this.x
        this.y = -this.y
        return this
    }
    distance(to) {
        return Math.sqrt(this.sqrtDistance(to))
    }
    sqrtDistance(to) {
        const x = this.x - to.x,
            y = this.y - to.y
        return x * x + y * y
    }
    normalize() {
        const inv = 1 / this.length()
        this.x *= inv
        this.y *= inv
        return this
    }
    length() {
        return Math.sqrt(this.sqrtLength())
    }
    sqrtLength() {
        return this.x * this.x + this.y * this.y
    }
    add(v) {
        return this.addxy(v.x, v.y)
    }
    addxy(x, y) {
        this.x += x
        this.y += y
        return this
    }
    substract(v) {
        return this.substractxy(v.x, v.y)
    }
    substractxy(x, y) {
        this.x -= x
        this.y -= y
        return this
    }
    multiply(num) {
        this.x *= num
        this.y *= num
        return this
    }
    devide(num) {
        return this.multiply(1 / num)
    }
    dot(v) {
        //向量内积 a.b, 如果知道向量夹角，a.b=|a|*|b|*cos<a,b>
        //向量内积表示的是一个向量在另一个向量上的投影长度，可以为负值
        return this.dotxy(v.x, v.y)
    }
    dotxy(x, y) {
        return this.x * x + this.y * y
    }
    cross(v) {
        //相当于行列式
        //|x  y |
        //|vx vy|
        //的值（行列式代表了点(0,0) 点(x,y) 点(vx,vy)确定的平行四边形面积。如果(x,y)到(vx, vy)是逆时针方向的，行列式符号为正，否则为负）
        //向量外积 a*b, 返回向量，是a b所在面的垂直向量
        //由于这里为2维向量，无法表达法向量，因此，只返回该法向量的标量，供vector3使用，vector3中表示该向量为(0, 0, this.x * point.y - this.y * point.x)
        //若 P × Q > 0 , 则P在Q的顺时针方向。     
        //若 P × Q < 0 , 则P在Q的逆时针方向。      
        //若 P × Q = 0 , 则P与Q共线，但可能同向也可能反向。 
        //外积用来求法向量
        //如果向量平行，外积为0
        //外积大小为|a|*|b|*sin<a,b> 外积大小为两条向量围成的平行四边形的面积
        //外积的另外一种作用，可以简单的求解三角形的面积，由于它的值为平行四边形的面积，除以2即可
        return this.crossxy(v.x, v.y)
    }
    crossxy(x, y) {
        return this.x * y - this.y * x
    }
    rotate(angle, cx, cy) {
        return this.rotateWithSinCos(Math.sin(angle), Math.cos(angle), cx, cy)
    }
    rotateWithSinCos(sin, cos, cx, cy) {
        let x = this.x,
            y = this.y

        /* Matrix
        |cos  -sin|
        |sin cos|
        */
        x -= cx
        y -= cy
        this.x = cos * x + sin * y + cx
        this.y = -sin * x + cos * y + cy

        //this.x = x * cos - y * sin - cx * cos + cy * sin + cx
        //this.y = x * sin + y * cos - cx * sin - cy * cos + cy
        //另一种解法为：
        //1.substract
        //2.rotate
        //3.-substract
        return this
    }
    angleTo(vector) {
        //向量夹角公式： a.b=|a|*|b|*cos<a,b>
        //cos = (this.x * vector.x + this.y * vector.y) / (this.x * this.x + this.y * this.y) / (vector.x * vector.x + vertor.y * vector.y)
        return Math.acos(this.dot(vector) / (this.length() * vector.length()))
    }
    transform(matrix) {
        const x = this.x,
            y = this.y
        this.x = matrix.a * x + matrix.c * y + matrix.e
        this.y = matrix.b * x + matrix.d * y + matrix.f
        return this
    }
    remove() {
        Vector.collect(this)
    }
    normal() {
        /*
        //顺时针
        --------------->
        |             |
        |             |
        |             |
        |             |
        <--------------
        3, 0
        0, -3
        -3, 0
        0, 3
        //y -x
        */
        return Vector.create(this.y, -this.x)
    }
    major() {
        if (Math.abs(this.x) > Math.abs(this.y)) {
            return Vector.create(this.x >= 0 ? 1 : -1, 0)
        } else {
            return Vector.create(0, this.y >= 0 ? 1 : -1)
        }
    }
    lerp(to, ratio) {
        ratio = Math.max(0, Math.min(1, ratio))
        this.addxy((to.x - this.x) * ratio, (to.y - this.y) * ratio)
        return this
    }
    lerpNoClamp(to, ratio) {
        this.addxy((to.x - this.x) * ratio, (to.y - this.y) * ratio)
        return this
    }
    moveTowards(target, maxDistanceDelta) {
        const dx = target.x - this.x
        const dy = target.y - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (!(dist <= maxDistanceDelta || dist == 0)) {

            const ratio = maxDistanceDelta / dist
            this.x += dx * ratio
            this.y += dy * ratio
        }
        return this
    }
}

const caches = []
Vector.create = function(x, y) {
    return (caches.length ? caches.pop() : new Vector).init(x, y)
}

Vector.collect = function(vector) {
    caches.push(vector)
}

Vector.clean = function() {
    caches.length = 0
}

/*
向量外积 a * b = ax * by - ay * bx = |A| * |B| * sin, 向量，大小和平行四边形面积算法一样
向量内积 a . b = ax * bx + ay * by = |A| * |B| * cos, 数值
向量平行时，外积为0
sin小于0时，外积小于0
向量垂直时，内积为0
2d中，仅将外积作为数值
*/

export default Vector