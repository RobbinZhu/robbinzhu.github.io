class InputComponent {
    constructor() {}
    init() {
        return this
    }
    update() {}
}

const caches = []
InputComponent.create = function() {
    return (caches.length ? caches.pop() : new InputComponent).init()
}
InputComponent.collect = function(component) {
    caches.push(component)
}
InputComponent.clean = function() {
    caches.length = 0
}
export default InputComponent