import Plist from './plist.js'

class TextureFrame {
    constructor() {}
    init(plist) {
        const plistParsed = Plist.parse(plist)
        const textureFrames = Object.create(null)
        Object.keys(plistParsed.frames).forEach(function(key, i, frames) {
            textureFrames[key] = plistParsed.frames[key].frame
        })
        this.frames = textureFrames
        return this
    }
    getFrameByName(name) {
        return this.frames[name]
    }
    getSource() {
        return
    }
    update() {
        return this
    }
    remove() {
        this.source = null
        TextureFrame.collect(this)
    }
}

const caches = []
TextureFrame.create = function(plist) {
    return (caches.length ? caches.pop() : new TextureFrame).init(plist)
}
TextureFrame.collect = function() {
    caches.push(this)
}
TextureFrame.clean = function() {
    caches.length = 0
}

export default TextureFrame