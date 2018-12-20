class Matrix {
    constructor() {}
    update(a, b, c, d, e, f) {
        /*
         * | a | c | e |
         * | b | d | f |
         *
         */
        this.a = a
        this.b = b
        this.c = c
        this.d = d
        this.e = e
        this.f = f
        return this
    }
    clone() {
        return Matrix.create(this.a, this.b, this.c, this.d, this.e, this.f)
    }
    translate(x, y) {
        //return this.transform(1, 0, 0, 1, x, y)
        this.e += this.a * x + this.c * y
        this.f += this.b * x + this.d * y
        return this
    }
    scale(sx, sy) {
        //return this.transform(sx, 0, 0, sy, 0, 0)
        this.a *= sx
        this.b *= sx
        this.c *= sy
        this.d *= sy
        return this
    }
    rotate(angle) {
        return this.rotateWithSinCos(Math.sin(angle), Math.cos(angle))
    }
    rotateWithRotation(rotation) {
        return this.rotateWithSinCos(rotation.sin, rotation.cos)
    }
    rotateWithSinCos(sin, cos) {
        const a = this.a,
            b = this.b,
            c = this.c,
            d = this.d
            //return this.transform(cos, sin, -sin, cos, 0, 0)
        this.a = a * cos + c * sin
        this.b = b * cos + d * sin
        this.c = -a * sin + c * cos
        this.d = -b * sin + d * cos
        return this
    }
    skew(x, y) {
        const a = this.a,
            b = this.b,
            c = this.c,
            d = this.d
        x = Math.tan(x)
        y = Math.tan(y)

        //return this.transform(1, x, y, 1, 0, 0)
        this.a += c * x
        this.b += d * x
        this.c += a * y
        this.d += b * y
        return this
    }
    transform(A, B, C, D, E, F) {
        const a = this.a,
            b = this.b,
            c = this.c,
            d = this.d,
            e = this.e,
            f = this.f

        this.a = a * A + c * B
        this.b = b * A + d * B
        this.c = a * C + c * D
        this.d = b * C + d * D
        this.e = a * E + c * F + e
        this.f = b * E + d * F + f
        return this
    }
    transformSomeMatrixTo(to, someMatrix) {
        const fromA = this.a,
            fromB = this.b,
            fromC = this.c,
            fromD = this.d,
            fromE = this.e,
            fromF = this.f
        const toA = to.a,
            toB = to.b,
            toC = to.c,
            toD = to.d,
            toE = to.e,
            toF = to.f

        let ratio = (fromA * fromD - fromB * fromC)
        if (ratio == 0) {
            ratio = 1
        } else {
            ratio = 1 / ratio
        }
        return someMatrix.update(
            (fromD * toA - fromC * toB) * ratio,
            (fromB * toA - fromA * toB) * -ratio,
            (fromD * toC - fromC * toD) * ratio,
            (fromB * toC - fromA * toD) * -ratio,
            (fromC * (fromF - toF) + fromD * (toE - fromE)) * ratio,
            (fromA * (fromF - toF) + fromB * (toE - fromE)) * -ratio
        )
    }
    transformMatrix(matrix) {
        return this.transform(
            matrix.a,
            matrix.b,
            matrix.c,
            matrix.d,
            matrix.e,
            matrix.f
        )
    }
    transformMatrixTo(matrix, output) {
        const a = this.a,
            b = this.b,
            c = this.c,
            d = this.d,
            e = this.e,
            f = this.f
        const A = matrix.a,
            B = matrix.b,
            C = matrix.c,
            D = matrix.d,
            E = matrix.e,
            F = matrix.f

        output.a = a * A + c * B
        output.b = b * A + d * B
        output.c = a * C + c * D
        output.d = b * C + d * D
        output.e = a * E + c * F + e
        output.f = b * E + d * F + f
        return output
    }
    transformVector(vector) {
        return vector.transform(this)
    }
    inverse() {
        return this.inverseTo(this)
    }
    inverseTo(output) {
        // http://mathworld.wolfram.com/MatrixInverse.html
        /*
        逆矩阵为
        |a22*a33-a23*a32 a13*a32-a33*a12 a12*a23-a22*a13|
        |a23*a31-a33*a21 a11*a33-a31*a13 a13*a21-a23*a11| * (1 /行列式的值)
        |a21*a32-a31*a22 a12*a31-a32*a11 a11*a22-a21*a12|

        1).
        先计算行列式的值
        a c e
        b d f
        0 0 1
        将第一行乘以 -b/a加到第二行
        a c e
        0 -cb/a + d -eb/a + f
        0 0        1
        变成了对角矩阵，对角矩阵的值是对角线上所有值的乘积
        a * (-cb/a+d) -> -cb + ad

        2).
        上面的矩阵代入变量，为
        |D*1-F*0 E*0-1*C C*F-D*E|
        |F*0-1*B A*1-0*E E*B-F*A|
        |B*0-0*D C*0-0*A A*D-B*C|

        |D -C CF-DE|
        |-B A EB-FA|
        |0  0 AD-BC|
        只取第一第二行
        */
        const a = this.a,
            b = this.b,
            c = this.c,
            d = this.d,
            e = this.e,
            f = this.f
        const determinant = 1 / (a * d - b * c)
        output.a = d * determinant
        output.b = -b * determinant
        output.c = -c * determinant
        output.d = a * determinant
        output.e = (c * f - d * e) * determinant
        output.f = (b * e - a * f) * determinant
        return output
    }
    reset() {
        return this.update(1, 0, 0, 1, 0, 0)
    }
    set(matrix) {
        this.a = matrix.a
        this.b = matrix.b
        this.c = matrix.c
        this.d = matrix.d
        this.e = matrix.e
        this.f = matrix.f
        return this
    }
    equal(to) {
        return this.a === to.a && this.b === to.b &&
            this.c === to.c && this.d === to.d &&
            this.e === to.e && this.f === to.f
    }
    remove() {
        Matrix.collect(this)
    }
    toString() {
        return 'matrix(' + this.a + ',' + this.b + ',' + this.c + ',' + this.d + ',' + this.e + ',' + this.f + ')'
    }
}

const caches = []

Matrix.create = function(a, b, c, d, e, f) {
    return (caches.length ? caches.pop() : new Matrix).update(a, b, c, d, e, f)
}

Matrix.collect = function(matrix) {
    caches.push(matrix)
}

Matrix.clean = function() {
    caches.length = 0
}

export default Matrix