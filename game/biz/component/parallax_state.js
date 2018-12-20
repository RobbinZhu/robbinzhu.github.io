import Vector from '../../common/vector.js'

import StateBaseComponent from './state_base.js'

class ParallaxStateComponent extends StateBaseComponent {
    constructor() {
        super()
    }
    init(host) {
        super.init(host)
        this.originWidth = undefined
        this.originHeight = undefined
        return this
    }
    update(session, camera) {
        const maxWidth = 200 * 64
        const maxHeight = 30 * 64
        const frame = camera.frame
        const space = this.host.spaceComponent
        if ((frame.width > space.width) || (frame.height > space.height)) {
            let ratioWidth = frame.width / space.width
            let ratioHeight = frame.height / space.height
            const max = Math.max(ratioWidth, ratioHeight)
            space.width *= max + 1
            space.height *= max + 1
        }
        /*
        [0, frame.x2] -> [0, frame.width - space.width]
        [0, frame.y2] -> [0, maxHeight - space.height]
        */
        space.position.x = Math.min(0, -frame.x2 / maxWidth * (frame.width - space.width))
        space.position.y = Math.min(0, frame.y2 / maxHeight * (frame.height - space.height))
    }
    remove() {
        super.remove()
        ParallaxStateComponent.collect(this)
    }
}

const caches = []
ParallaxStateComponent.create = function(host) {
    return (caches.length ? caches.pop() : new ParallaxStateComponent).init(host)
}
ParallaxStateComponent.collect = function(component) {
    caches.push(component)
}
ParallaxStateComponent.clean = function() {
    caches.length = 0
}

export default ParallaxStateComponent