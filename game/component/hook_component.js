class HookComponent {
    constructor() {}
    init(host) {
        this.host = host
        this.onUpdate = []
        this.onRemove = []
        this.afterUpdate = []
        return this
    }
    update() {
        return this
    }
    handleOnUpdate() {
        const args = arguments
        for (let i = 0, j = this.onUpdate.length; i < j; i++) {
            this.onUpdate[i].apply(this.host, args)
        }
    }
    handleAfterUpdate() {
        const args = arguments
        for (let i = 0, j = this.afterUpdate.length; i < j; i++) {
            this.afterUpdate[i].apply(this.host, args)
        }
    }
    handleOnRemove() {
        const args = arguments
        for (let i = 0, j = this.onRemove.length; i < j; i++) {
            this.onRemove[i].apply(this.host, args)
        }
    }
    remove() {
        this.handleOnRemove()
        this.host =
            this.onUpdate =
            this.afterUpdate =
            this.onRemove = null
        HookComponent.collect(this)
    }
}

const caches = []
HookComponent.create = function(host) {
    return (caches.length ? caches.pop() : new HookComponent).init(host)
}
HookComponent.collect = function(component) {
    caches.push(component)
}
HookComponent.clean = function() {
    caches.length = 0
}
export default HookComponent