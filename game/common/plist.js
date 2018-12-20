function loop(parent) {
    switch (parent.nodeName) {
        case 'string':
            return parent.innerHTML
            break
        case 'false':
            return false
            break
        case 'true':
            return true
            break
        case 'integer':
            return parent.innerHTML | 0
            break
    }
    const json = Object.create(null)
    const children = Array.prototype.slice.call(parent.children, 0)
    for (let i = 0; i < children.length;) {
        const key = children[i++]
        const value = children[i++]
        json[key.innerHTML] = loop(value)
    }
    return json
}

function arraify(text) {
    return text.replace(/[{}]/ig, '')
        .split(',').map(function(value) {
            return value.trim() | 0
        })
}

function parse(text) {
    const parser = new DOMParser
    const xmlDoc = parser.parseFromString(text, "text/xml")
    const dict = xmlDoc.querySelector('plist dict')
    if (!dict) {
        return
    }
    const json = loop(dict)

    Object.keys(json.frames).forEach(function(key, i) {
        const item = json.frames[key]
        item.frame = arraify(item.frame)
        item.frame.push(item.rotated)
        item.offset = arraify(item.offset)
        item.sourceColorRect = arraify(item.sourceColorRect)
        item.sourceSize = arraify(item.sourceSize)
    })
    return json
}

export default {
    parse
}