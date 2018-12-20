class MoveLeftCommand {
    constructor() {
        super()
    }
    init() {
        super.init()
        return this
    }
    execute(actor) {
        actor.moveLeft()
    }
}

const caches = []
MoveLeftCommand.create = function() {
    return (caches.length ? caches.pop() : new MoveLeftCommand).init()
}
MoveLeftCommand.collect = function(command) {
    caches.push(command)
}
MoveLeftCommand.clean = function() {
    caches.length = 0
}
export default MoveLeftCommand