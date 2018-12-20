import throttle from '../../common/throttle.js'

import InputState from './input_state.js'
import BulletStateComponent from './bullet_state.js'
import PubsubComponent from '../../component/pubsub_component.js'

import StateBaseComponent from './state_base.js'

import Node from '../../node/node.js'

const CollisionHandler = {
    'bullet': {
        'hero': function() {
            console.log('skip bullet collsion with hero')
        },
        'frog': function(bullet, frog) {
            frog.nodeTreeComponent && frog.nodeTreeComponent.removeFromParent()
            bullet.nodeTreeComponent && bullet.nodeTreeComponent.removeFromParent()
            console.log('bullet collision to frog')
        }
    },
    'frog': {
        'hero': function(frog, hero) {
            frog.nodeTreeComponent && frog.nodeTreeComponent.removeFromParent()
            console.log('frog collision to hero')
        }
    }
}

function findTarget(nodes, name) {
    let child
    for (var i = 0; i < nodes.length; i++) {
        child = nodes[i]
        if (child.name == name) {
            return child
        }
    }
}
class SceneStateComponent extends StateBaseComponent {
    constructor() {
        super()
    }
    init(host) {
        this.host = host
        this.fireTarget = null

        this.pubsubComponent = PubsubComponent.create(this)
        this.fire = throttle(function() {
            if (!this.fireTarget) {
                this.fireTarget = findTarget(this.host.nodeTreeComponent.children, 'hero')
            }
            if (!this.fireTarget) {
                return
            }
            const bullet = Node.create('bullet')
            bullet.graphicsComponent.color = '#FFF'
            bullet.spaceComponent.width = 30
            bullet.spaceComponent.height = 14
            bullet.spaceComponent.position.set(this.fireTarget.spaceComponent.position).addxy(0, 20)
            bullet.addStateComponent(BulletStateComponent.create(bullet, this.fireTarget.spaceComponent.scale.x))
            this.host.nodeTreeComponent.addChild(bullet)
            console.log('add bullet')
        }, 300)

        this.pubsubComponent.on('collision', function(nodeA, nodeB) {
            if (nodeA.name > nodeB.name) {
                const temp = nodeB
                nodeB = nodeA
                nodeA = temp
            }
            const handler = CollisionHandler[nodeA.name]
            if (handler && handler[nodeB.name]) {
                handler[nodeB.name](nodeA, nodeB)
            }
        })
        return this
    }
    update(session) {
        const input = session.commandInputComponent
        const firePressed = input.getInput(InputState.Fire)
        if (firePressed) {
            this.fire()
        }
    }
    remove() {
        super.remove()
        this.pubsubComponent.remove()
        this.fireTarget = this.fire = this.pubsubComponent = null
        SceneStateComponent.collect(this)
    }
}


const caches = []
SceneStateComponent.create = function(host) {
    return (caches.length ? caches.pop() : new SceneStateComponent).init(host)
}
SceneStateComponent.collect = function(component) {
    caches.push(component)
}
SceneStateComponent.clean = function() {
    caches.length = 0
}

export default SceneStateComponent