import Pubsub from '../common/pubsub.js'
import ActionManager from '../action/action_manager.js'

function sort(a, b) {
    return a.zIndex - b.zIndex
}

class Base {
    constructor() {
        this.children = []
        this.parent = null

        this.onUpdate = []
        this.onRemove = []
        this.afterUpdate = []
        this.actionManager = ActionManager.create(this)
    }
    handleOnUpdate() {
        const args = arguments
        for (let i = 0, j = this.onUpdate.length; i < j; i++) {
            this.onUpdate[i].apply(this, args)
        }
    }
    updateAction(session) {
        this.actionManager.update(session)
    }
    handleAfterUpdate() {
        const args = arguments
        for (let i = 0, j = this.afterUpdate.length; i < j; i++) {
            this.afterUpdate[i].apply(this, args)
        }
    }
    handleOnRemove() {
        const args = arguments
        for (let i = 0, j = this.onRemove.length; i < j; i++) {
            this.onRemove[i].apply(this, args)
        }
    }
    pub() {
        Pubsub.pub.apply(null, arguments)
        return this
    }
    on(key, fn) {
        Pubsub.on(this, key, fn)
        return this
    }
    off() {
        Pubsub.off(this)
        return this
    }
    addChild(child, at) {
        if (undefined === at) {
            this.children.push(child)
        } else {
            for (let i = this.children.length; i > at; i--) {
                this.children[i] = this.children[i - 1]
            }
            this.children[at] = child
        }
        child.parent = this
        return this
    }
    sortChildren() {
        this.children.sort(sort)
        return this
    }
    removeChild(child) {
        return this.removeChildAt(this.children.indexOf(child))
    }
    removeChildAt(index) {
        this.children[index].remove()
        for (let i = index, j = this.children.length - 1; i < j; i++) {
            this.children[i] = this.children[i + 1]
        }
        --this.children.length
        return this
    }
    removeChildren() {
        for (let i = 0, j = this.children.length; i < j; i++) {
            this.children[i].remove()
        }
        this.children.length = 0
        return this
    }
    removeFromParent() {
        if (this.parent) {
            this.parent.removeChild(this)
        }
        return this
    }
    _collect() {
        console.error('you need implement _collect function by yourself')
    }
    remove() {
        this.handleOnRemove()
        this.off()
        this.actionManager.remove()
        this.removeChildren()
        this.onUpdate =
            this.afterUpdate =
            this.onRemove =
            this.actionManager =
            this.children =
            this.parent = null
    }
}
export default Base