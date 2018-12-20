class FireCommand {
    constructor() {
        super()
    }
    init() {
        super.init()
        return this
    }
    execute(actor) {
        actor.fire()
    }
}

const caches = []
FireCommand.create = function() {
    return (caches.length ? caches.pop() : new FireCommand).init()
}
FireCommand.collect = function(command) {
    caches.push(command)
}
FireCommand.clean = function() {
    caches.length = 0
}
export default FireCommand