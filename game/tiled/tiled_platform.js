import ImageLoader from '../common/image_loader.js'

function initLayers(tiledMap) {
    const mapLayers = tiledMap.layers
    const tileheight = tiledMap.tileheight
    const tilewidth = tiledMap.tilewidth
    const layers = []
    const tileset = tiledMap.tilesets[0]
    const countX = (tileset.imagewidth / tileset.tilewidth) | 0
    const countY = (tileset.imageheight / tileset.tileheight) | 0
    const countXI = 1 / countX
    const countYI = 1 / countY
    const image = tileset.image
    const firstgid = tileset.firstgid
    const tileoffset = tileset.tileoffset
    for (let a = 0, b = mapLayers.length; a < b; a++) {
        const layer = mapLayers[a]
        const layerwidth = layer.width
        if (!layer.visible) {
            continue
        }
        switch (layer.type) {
            case 'tilelayer':
                const items = []
                const layerData = {
                    items: items,
                    data: layer.data,
                    tilewidth: tilewidth,
                    tileheight: tileheight,
                    height: layer.height,
                    name: layer.name,
                    opacity: layer.opacity,
                    type: layer.type,
                    visible: layer.visible,
                    width: layer.width,
                    x: layer.x,
                    y: layer.y
                }

                layers.push(layerData)
                const data = layer.data
                let x = 0,
                    y = 0
                for (let i = 0, j = data.length; i < j; i++) {
                    let gid = data[i]
                    if (gid > 0) {
                        gid -= firstgid
                        items.push(image,
                            gid,
                            x,
                            y,
                            (gid % countX) * tileset.tilewidth - tileoffset.x, ((gid * countXI) | 0) * tileset.tileheight + tileoffset.y,
                            tilewidth, tileheight,
                            x * tilewidth, y * tileheight,
                            tilewidth, tileheight)
                    }
                    if (++x == layerwidth) {
                        x = 0
                        y++
                    }
                }
                break
            case 'objectgroup':
                for (let i = 0, j = layer.objects.length; i < j; i++) {
                    const object = layer.objects[i]
                    const gid = object.gid
                    if (gid > 0) {
                        continue
                    }
                }
                break
        }
    }
    return layers
}

class TiledPlat {
    constructor() {}
    initWithTiledMap(tiledMap) {
        this.isActive = true
        this.renderItems = []
        this.zIndex = 0
        this.layers = initLayers(tiledMap)
        this.visibleTiles = []
        this.collideLayer = this.getCollideLayer()
        return this
    }
    update() {
        return this
    }
    render(session, camera) {
        const layers = this.layers
        this.visibleTiles.length = 0
        let x1 = camera.frame.x,
            y1 = camera.frame.y,
            x2 = camera.frame.x2,
            y2 = camera.frame.y2
        const matrix = camera._matrixI
        session.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f)
        for (let i = 0, j = layers.length; i < j; i++) {
            this.renderLayer(session, layers[i], x1, x2, y1, y2)
        }
    }
    renderLayer(session, layer, x1, x2, y1, y2) {
        let texture,
            cachedImage
        const items = layer.items
        const cache = layer.name == 'main'
        const visibleTiles = this.visibleTiles
        for (let a = 0, b = items.length; a < b;) {
            const image = items[a++],
                gid = items[a++],
                x = items[a++],
                y = items[a++],
                sourceX = items[a++],
                sourceY = items[a++],
                sourceWidth = items[a++],
                sourceHeight = items[a++],
                desX = items[a++],
                desY = items[a++],
                destWidth = items[a++],
                destHeight = items[a++]
            if (!(
                    desX > x2 ||
                    desY > y2 ||
                    (desX + destWidth) < x1 ||
                    (desY + destHeight) < y1
                )) {
                if (cache) {
                    visibleTiles.push(gid, x, y)
                }
                texture = ImageLoader.get(image)
                if (!texture) {
                    ImageLoader.load(image)
                }
                if (texture) {
                    session.drawImage(
                        texture,
                        sourceX, sourceY, sourceWidth, sourceHeight,
                        desX - 1, desY - 1, destWidth + 2, destHeight + 2
                    )
                }
            }
        }
    }
    getCollideLayer() {
        let collideLayer
        const layers = this.layers
        for (let i = 0, j = layers.length; i < j; i++) {
            const layer = layers[i]
            if (layer.name == 'main') {
                collideLayer = layer
            }
            break
        }
        return collideLayer
    }
    remove() {
        this.layers = null
        this.renderItems = null
        this.visibleTiles = null
        TiledPlat.collect(this)
    }
    collideToNode(node) {
        const collideLayer = this.collideLayer
        const physicsNode = node.physicsNodeComponent
        
    }
}

const caches = []
TiledPlat.create = function(tiledMap) {
    return (caches.length ? caches.pop() : new TiledPlat).initWithTiledMap(tiledMap)
}
TiledPlat.collect = function(tiled) {
    caches.push(tiled)
}
TiledPlat.clean = function() {
    caches.length = 0
}
export default TiledPlat