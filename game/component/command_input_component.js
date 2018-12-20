class CommandInputComponent {
    constructor() {}
    init() {
        this.mask = 0
        return this
    }
    addInput(input) {
        this.mask |= input
    }
    removeInput(input) {
        this.mask &= ~input
    }
    getInput(input) {
        return this.mask & input
    }
    getMask() {
        return this.mask
    }
    reset() {
        this.mask = 0
    }
}

const caches = []
CommandInputComponent.create = function() {
    return (caches.length ? caches.pop() : new CommandInputComponent).init()
}
CommandInputComponent.collect = function(component) {
    caches.push(component)
}
CommandInputComponent.clean = function() {
    caches.length = 0
}

export default CommandInputComponent