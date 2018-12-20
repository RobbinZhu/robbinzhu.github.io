class MoveRightCommand {
    constructor() {
        super()
    }
    init() {
        super.init()
        return this
    }
    execute(actor) {
        actor.moveRight()
    }
}

const caches = []
MoveRightCommand.create = function() {
    return (caches.length ? caches.pop() : new MoveRightCommand).init()
}
MoveRightCommand.collect = function(command) {
    caches.push(command)
}
MoveRightCommand.clean = function() {
    caches.length = 0
}
export default MoveRightCommand