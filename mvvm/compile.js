import DomNode from './dom_node.js'
import Watcher from './watcher.js'
import DataListener from './data_listener.js'

function compileCascade(node, data, onlyCompileCurNode) {
    if (!node) {
        return
    }

    let nextSibling
    if (!onlyCompileCurNode) {
        nextSibling = DomNode.getNextSibling(node)
    }
    const tagName = DomNode.getNodeName(node)
    const component = data.getComponent(tagName.toLowerCase())
    if (component) {
        data.initComponent(node, data, component)
    } else {
        switch (DomNode.getNodeType(node)) {
            case 3:
                handleContent(DomNode.getTextContent(node), node, data)
                break
            case 1:
                let canCompileChildren = true
                const names = DomNode.getAttributeNames(node)
                    // console.log(names, node)
                if (names.indexOf(':for-array') > -1) {
                    canCompileChildren = false
                    handleFor(node, data)
                } else {
                    let index
                    index = names.indexOf(':if')
                    if (index > -1) {
                        canCompileChildren = false
                        names[index] = null
                        handleIf(node, data)
                    }
                    index = names.indexOf(':model')
                    if (index > -1) {
                        names[index] = null
                        handleModel(node, data)
                    }
                    index = names.indexOf(':text')
                    if (index > -1) {
                        names[index] = null
                        handleText(node, data)
                    }
                    index = names.indexOf(':show')
                    if (index > -1) {
                        names[index] = null
                        handleShow(node, data)
                    }
                    index = names.indexOf(':html')
                    if (index > -1) {
                        names[index] = null
                        handleHTML(node, data)
                    }
                    index = names.indexOf(':class')
                    if (index > -1) {
                        names[index] = null
                        handleClass(node, data)
                    }
                    index = names.indexOf(':style')
                    if (index > -1) {
                        names[index] = null
                        handleStyle(node, data)
                    }
                    names.forEach(function(name, index) {
                        if (name === null) {
                            return
                        }
                        if (name.indexOf(':on-') == 0) {
                            names[index] = null
                            handleEvent(name, node, data)
                            return
                        }
                        if (name.indexOf(':') == 0) {
                            names[index] = null
                            handleAttribute(name, node, data)
                        }
                    })
                }
                if (canCompileChildren) {
                    compileCascade(DomNode.getFirstChild(node), data)
                }
                break
        }
    }
    if (!onlyCompileCurNode) {
        compileCascade(nextSibling, data)
    }
}

function handleContent(text, node, data) {
    // console.log('handleContent', text)
    let from = 0
    const content = []
    let needListen
    while (true) {
        const open = text.indexOf('{{', from)
        if (open > -1) {
            content.push(text.slice(from, open))
            const close = text.indexOf('}}', open + 2)
            if (close > -1) {
                needListen = true
                content.push(buildRenderFn(text.slice(open + 2, close)))
                from = close + 2
            }
        } else {
            content.push(text.slice(from))
            break
        }
    }
    if (!needListen) {
        return
    }
    Watcher.watch(node, data, function(node, data) {
        // console.log('content update')
        DomNode.setTextContent(node, content.map(function(part) {
            if (typeof part == 'function') {
                return part(data)
            }
            return part
        }).join(''))
    })
}

function handleShow(node, data) {
    const text = DomNode.getAttribute(node, ':show')
    DomNode.removeAttribute(node, ':show')
        // console.log('handleShow', text)
    const fn = buildRenderFn(text)
    Watcher.watch(node, data, function(node, data) {
        node.style.display = fn(data) ? '' : 'none'
    })
}

function handleIf(node, data) {
    const text = DomNode.getAttribute(node, ':if')
    DomNode.removeAttribute(node, ':if')
        // console.log('handleIf', text)
    const fn = buildRenderFn(text)
    const placeholder = DomNode.createTextNode('')

    let prevShow
    Watcher.watch(node, data, function(node, data, listener) {
        const show = !!fn(data)
        if (show === prevShow) {
            return
        }
        if (prevShow === undefined) {
            if (show) {
                compileCascade(DomNode.getFirstChild(node), data)
            } else {
                DomNode.replaceOldWithNew(node, placeholder)
            }
        } else {
            if (show) {
                DomNode.replaceOldWithNew(placeholder, node)
                compileCascade(DomNode.getFirstChild(node), data)
            } else {
                DomNode.replaceOldWithNew(node, placeholder)
            }
        }
        prevShow = show
    })
}

function handleFor(node, data) {
    const arrayText = DomNode.getAttribute(node, ':for-array')
    const itemText = DomNode.getAttribute(node, ':for-item')
    const itemIndex = DomNode.getAttribute(node, ':for-index')
    DomNode.removeAttribute(node, ':for-array')
    DomNode.removeAttribute(node, ':for-item')
    DomNode.removeAttribute(node, ':for-index')

    const fn = buildRenderFn(arrayText)
    const startPlaceholder = DomNode.createTextNode('')
    const endPlaceholder = DomNode.createTextNode('')
    const parentNode = DomNode.getParentNode(node)
    DomNode.replaceOldWithNew(node, endPlaceholder, parentNode)
    DomNode.insertNewBeforeOld(startPlaceholder, endPlaceholder, parentNode)

    function createContext(item, index) {
        const context = Object.create(data)
        if (itemIndex) {
            context[itemIndex] = index
            DataListener.listen(context)
        }
        Object.defineProperty(context, itemText, {
            value: item,
            enumerable: false,
            writable: false,
            configurable: true
        })
        return context
    }

    let arrayCached = []
    let contextCached = []
    let arrayCachedNew = []
    let contextCachedNew = []
    Watcher.watch(node, data, function(node, data) {
        const array = fn(data)
        let oldCursor = 0,
            newCursor = 0
        const newArrayLen = array.length
        const oldArrayLen = arrayCached.length

        let childNodes = []
        let cursor = DomNode.getNextSibling(startPlaceholder)
        while (cursor !== endPlaceholder) {
            childNodes.push(cursor)
            cursor = DomNode.getNextSibling(cursor)
        }
        let innerPlaceHolder = startPlaceholder
            /*
            console.warn('new ', array.map(function(item) {
                return item.id
            }).join(' '), 'old', arrayCached.map(function(item) {
                return item.id
            }).join(' '))*/

        while (newCursor < newArrayLen || oldCursor < oldArrayLen) {
            const newItem = newCursor < newArrayLen ? array[newCursor] : undefined
            const oldItem = oldCursor < oldArrayLen ? arrayCached[oldCursor] : undefined
            const oldContext = oldCursor < oldArrayLen ? contextCached[oldCursor] : undefined
            let oldDom = oldCursor < oldArrayLen ? childNodes[oldCursor] : undefined

            if (oldItem === newItem) {
                //元素不变
                // innerPlaceHolder = domCachedNew[newCursor] = domCached[oldCursor]
                arrayCachedNew[newCursor] = newItem
                const context = oldCursor < oldArrayLen ? contextCached[oldCursor] : undefined
                contextCachedNew[newCursor] = context
                if (itemIndex) {
                    context[itemIndex] = newCursor
                }
                innerPlaceHolder = childNodes[oldCursor]
                newCursor++
                oldCursor++
                continue
            }
            if (newItem === undefined) {
                //被删除的元素，清除oldItem？？？
                childNodes[oldCursor] && DomNode.removeNode(childNodes[oldCursor], parentNode)
                oldCursor++
                innerPlaceHolder = childNodes[oldCursor]
                continue
            }
            const newItemInCacheIndex = arrayCached.indexOf(newItem)
            const oldItemInNewIndex = array.indexOf(oldItem)
            if (newItemInCacheIndex >= 0 && oldItemInNewIndex >= 0) {
                const newDom = childNodes[newItemInCacheIndex]
                arrayCachedNew[newCursor] = newItem
                const context = contextCached[newItemInCacheIndex]
                contextCachedNew[newCursor] = context
                if (itemIndex) {
                    context[itemIndex] = newCursor
                }
                childNodes[newItemInCacheIndex] = null
                DomNode.insertNewAfterOld(newDom, innerPlaceHolder)
                innerPlaceHolder = newDom
                newCursor++
                continue
            }
            if (newItemInCacheIndex == -1) {
                //新加的元素
                const newDom = DomNode.cloneNode(node)

                DomNode.insertNewAfterOld(newDom, innerPlaceHolder, parentNode)
                innerPlaceHolder = DomNode.getNextSibling(newDom)
                const context = createContext(newItem, newCursor)
                arrayCachedNew[newCursor] = newItem
                contextCachedNew[newCursor] = context
                compileCascade(newDom, context, true)
                innerPlaceHolder = DomNode.getPreviousSibling(innerPlaceHolder)
                newCursor++
                continue
            }
            if (oldItemInNewIndex == -1) {
                //删除的元素
                oldCursor++
                if (oldItem) {
                    innerPlaceHolder = DomNode.getNextSibling(oldDom)
                    DomNode.removeNode(oldDom)
                    continue
                }
            }
        }

        let old = arrayCached
        arrayCached = arrayCachedNew
        arrayCachedNew = old

        old = contextCached
        contextCached = contextCachedNew
        contextCachedNew = old
        arrayCachedNew.length = contextCachedNew.length = 0
    })
}

function handleModel(node, data) {
    const text = DomNode.getAttribute(node, ':model')
    DomNode.removeAttribute(node, ':model')

    const fn = buildRenderFn(text)
    const updateOriginFn = buildUpdateOriginFn(text)

    DomNode.addEventListener(node, 'input', function() {
        updateOriginFn(data, this.value)
    })
    Watcher.watch(node, data, function(node, data) {
        DomNode.setValue(node, fn(data))
    })
}

function handleText(node, data) {
    const text = DomNode.getAttribute(node, ':text')
    DomNode.removeAttribute(node, ':text')
    const fn = buildRenderFn(text)
    Watcher.watch(node, data, function(node, data) {
        DomNode.setInnerText(node, fn(data))
    })
}

function handleHTML(node, data) {
    const text = DomNode.getAttribute(node, ':html')
    DomNode.removeAttribute(node, ':html')
    const fn = buildRenderFn(text)
    Watcher.watch(node, data, function(node, data) {
        DomNode.setInnerHTML(node, fn(data))
    })
}

function handleClass(node, data) {
    const text = DomNode.getAttribute(node, ':class')
    DomNode.removeAttribute(node, ':class')
    const fn = buildRenderFn(text)
    Watcher.watch(node, data, function(node, data) {
        const classes = fn(data)
        switch (Object.prototype.toString.call(classes)) {
            case '[object Object]':
                Object.keys(classes).forEach(function(key) {
                    DomNode[classes[key] ? 'addClass' : 'removeClass'](node, key)
                })
                break
            case '[object Array]':
                break
        }
    })
}

function handleStyle(node, data) {
    const text = DomNode.getAttribute(node, ':style')
    DomNode.removeAttribute(node, ':style')
    const fn = buildRenderFn(text)
    Watcher.watch(node, data, function(node, data) {
        const styles = fn(data)
        switch (Object.prototype.toString.call(styles)) {
            case '[object Object]':
                Object.keys(styles).forEach(function(key) {
                    const style = styles[key]
                    if (style.indexOf('important') > -1) {
                        node.style.setProperty(key, style.replace('!important', ''), 'important')
                    } else {
                        node.style.setProperty(key, style)
                    }
                })
                break
            case '[object String]':
                break
        }
    })
}

function handleAttribute(name, node, data) {
    const text = DomNode.getAttribute(node, name)
    DomNode.removeAttribute(node, name)
    const fn = buildRenderFn(text)
    name = name.slice(1)
    Watcher.watch(node, data, function(node, data) {
        DomNode.setAttribute(node, name, fn(data))
    })
}

const eventFnCache = {}

function buildEventFn(text) {
    let fn = eventFnCache[text]
    if (!fn) {
        fn = eventFnCache[text] = new Function('e, __scope__', 'with(__scope__) {try{' + text + '}catch(e){console.error(e);}}')
    }
    return fn
}

function handleEvent(name, node, data) {
    const text = DomNode.getAttribute(node, name)
    DomNode.removeAttribute(node, name)
    const fn = buildEventFn(text)
        // console.log(node, name)
    DomNode.addEventListener(node, name.slice(4), function(e) {
        fn(e, data)
    }, false)
}

const renderFnCache = {}

function buildRenderFn(text) {
    let fn = renderFnCache[text]
    if (!fn) {
        fn = renderFnCache[text] = new Function(
            '__scope__',
            'with(__scope__) {\
            try{\
                return ' + text +
            '} catch(e) {\
                console.error(e);\
                return ""\
            }\
        }')
    }
    return fn
}

const updateOriginFnCache = {}

function buildUpdateOriginFn(text) {
    let fn = updateOriginFnCache[text]
    if (!fn) {
        fn = updateOriginFnCache[text] = new Function('__scope__, value', 'with(__scope__){' + text + '= value}')
    }
    return fn
}

function compile(text, vm, el, isComponent) {
    const domWrap = DomNode.createElement('div')
    const fragment = DomNode.createFragment()
    DomNode.setInnerHTML(domWrap, text)

    compileCascade(DomNode.getFirstChild(domWrap), vm)

    let firstChild = DomNode.getFirstChild(domWrap)
    while (firstChild) {
        DomNode.appendChildToParent(firstChild, fragment)
        firstChild = DomNode.getFirstChild(domWrap)
    }
    // console.log(el, fragment.childNodes)
    if (el) {
        if (isComponent) {
            DomNode.replaceOldWithNew(el, fragment)
        } else {
            DomNode.setInnerHTML(el, '')
            DomNode.appendChildToParent(fragment, el)
        }
    }
}

export default compile