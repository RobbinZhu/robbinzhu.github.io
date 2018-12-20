function sort(a, b) {
    return a.nodeTreeComponent.zIndex - b.nodeTreeComponent.zIndex
}
class NodeTreeComponent {
    constructor() {}
    init(host) {
        this.host = host
        this.children = []
        this.parent = null
        this.zIndex = 0
        return this
    }
    updateZIndex(index) {
        this.zIndex = index
    }
    update() {}
    addChild(child, at) {
        const children = this.children
        if (undefined === at) {
            children.push(child)
        } else {
            for (let i = children.length; i > at; i--) {
                children[i] = children[i - 1]
            }
            children[at] = child
        }
        child.nodeTreeComponent.parent = this
        return this
    }
    addChildSort(item) {
        //TODO sort auto when addChild
        let total = this.children.length - 1
        let child
        while (total > 0) {
            child = this.children[total]
            if (child.zIndex >= item.zIndex) {
                break
            }
        }
    }
    sortChildren() {
        this.children.sort(sort)
        return this
    }
    removeChild(child) {
        return this.removeChildAt(this.children.indexOf(child))
    }
    removeChildAt(index) {
        const children = this.children
        children[index].remove()
        for (let i = index, j = children.length - 1; i < j; i++) {
            children[i] = children[i + 1]
        }
        --children.length
        return this
    }
    removeChildren() {
        const children = this.children
        for (let i = 0, j = children.length; i < j; i++) {
            children[i].remove()
        }
        children.length = 0
        return this
    }
    removeFromParent() {
        if (this.parent) {
            this.parent.removeChild(this.host)
        }
        return this
    }
    remove() {
        this.removeChildren()
        this.host =
            this.children =
            this.parent = null
    }
}

const caches = []
NodeTreeComponent.create = function(host) {
    return (caches.length ? caches.pop() : new NodeTreeComponent).init(host)
}
NodeTreeComponent.collect = function(component) {
    caches.push(component)
}
NodeTreeComponent.clean = function() {
    caches.length = 0
}
export default NodeTreeComponent