import Pubsub from './pubsub.js'
class Resolution {
    constructor() {
        this.designWidth = 0
        this.designHeight = 0
        this.width = 0
        this.height = 0
        this.minWidthDevideHeight = 1
        this.maxWidthDevideHeight = 1

        this.on('win-resize', function() {
            const width = window.innerWidth
            const height = window.innerHeight

            let devide = width / height
            const designRatio = this.designWidth / this.designHeight
            if (devide < designRatio) {
                devide = Math.max(devide, this.minWidthDevideHeight)
                this.width = this.designWidth
                this.height = Math.ceil(this.designWidth / devide)
            } else if (devide > designRatio) {
                devide = Math.min(devide, this.maxWidthDevideHeight)
                this.height = this.designHeight
                this.width = Math.ceil(this.designHeight * devide)
            } else {
                this.width = width
                this.height = height
            }
            // console.log(this.width, this.height)
            this.pub('resolution-change', this.width, this.height)
        })
    }
    setResolution(width, height, minWidthDevideHeight, maxWidthDevideHeight) {
        this.designWidth = width
        this.designHeight = height
        this.minWidthDevideHeight = minWidthDevideHeight
        this.maxWidthDevideHeight = maxWidthDevideHeight
        this.update(width, height)
    }
    update(width, height) {
        this.width = width
        this.height = height
    }
    on(key, fn) {
        Pubsub.on(this, key, fn)
    }
    pub() {
        Pubsub.pub.apply(null, arguments)
    }
    remove() {
        this.off()
        Resolution.collect(this)
    }
}
const cache = []
Resolution.create = function() {
    return cache.length ? cache.pop() : new Resolution
}

Resolution.collect = function(resolution) {
    cache.push(resolution)
}

/*
const Resolution = {
    designWidth: 0,
    designHeight: 0,
    width: 0,
    height: 0,
    minWidthDevideHeight: 1,
    maxWidthDevideHeight: 1,
    setResolution(width, height, minWidthDevideHeight, maxWidthDevideHeight) {
        this.designWidth = width
        this.designHeight = height
        this.minWidthDevideHeight = minWidthDevideHeight
        this.maxWidthDevideHeight = maxWidthDevideHeight
        this.update(width, height)
    },
    update(width, height) {
        this.width = width
        this.height = height
    },
    on(key, fn) {
        Pubsub.on(this, key, fn)
    },
    pub() {
        Pubsub.pub.apply(null, arguments)
    }
}
Resolution.on('win-resize', function() {
    const width = window.innerWidth
    const height = window.innerHeight

    let devide = width / height
    const designRatio = this.designWidth / this.designHeight
    if (devide < designRatio) {
        devide = Math.max(devide, this.minWidthDevideHeight)
        this.width = this.designWidth
        this.height = Math.ceil(this.designWidth / devide)
    } else if (devide > designRatio) {
        devide = Math.min(devide, this.maxWidthDevideHeight)
        this.height = this.designHeight
        this.width = Math.ceil(this.designHeight * devide)
    } else {
        this.width = width
        this.height = height
    }
    // console.log(this.width, this.height)
    this.pub('resolution-change', this.width, this.height)
})
*/
export default Resolution