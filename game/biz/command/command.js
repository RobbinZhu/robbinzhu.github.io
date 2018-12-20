class Command {
    constructor() {}
    init() {
        return this
    }
    execute() {}
}

const caches = []
Command.create = function() {
    return (caches.length ? caches.pop() : new Command).init()
}
Command.collect = function(command) {
    caches.push(command)
}
Command.clean = function() {
    caches.length = 0
}
export default Command