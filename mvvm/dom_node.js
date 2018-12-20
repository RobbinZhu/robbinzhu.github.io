function replaceOldWithNew(oldItem, newItem, parentNode) {
    (parentNode || oldItem.parentNode).replaceChild(newItem, oldItem)
}

function appendChildToParent(child, parent) {
    parent.appendChild(child)
}

function getParentNode(node) {
    return node.parentNode
}

function getNextSibling(node) {
    return node.nextSibling
}

function getPreviousSibling(node) {
    return node.previousSibling
}

function getTextContent(node) {
    return node.textContent
}

function setTextContent(node, text) {
    node.textContent = text
}

function getAttributeNames(node) {
    return node.getAttributeNames()
}

function getAttribute(node, name) {
    return node.getAttribute(name)
}

function setAttribute(node, name, value) {
    node.setAttribute(name, value)
}

function getNodeType(node) {
    return node.nodeType
}

function getNodeName(node) {
    return node.nodeName
}

function removeNode(node, parentNode) {
    (parentNode || (node.parentNode && node.parentNode)).removeChild(node)
}

function cloneNode(node) {
    return node.cloneNode(true)
}

function getFirstChild(node) {
    return node.firstChild
}

function getChildNodes(node) {
    return node.childNodes
}

function insertNewBeforeOld(newItem, oldItem, parentNode) {
    //oldItem为空时，insertBefore等于appendChild
    (parentNode || oldItem.parentNode).insertBefore(newItem, oldItem)
}

function insertNewAfterOld(newItem, oldItem, parentNode) {
    (parentNode || oldItem.parentNode).insertBefore(newItem, getNextSibling(oldItem))
}

function removeAttribute(node, name) {
    node.removeAttribute(name)
}

function createTextNode(text) {
    return document.createTextNode(text)
}

function setValue(node, value) {
    node.value = value
}

function setInnerText(node, text) {
    node.innerText = text
}

function setInnerHTML(node, text) {
    node.innerHTML = text
}

function addEventListener(node, name, fn, options) {
    node.addEventListener(name, fn, options)
}

function createElement(type) {
    return document.createElement(type)
}

function createFragment() {
    return document.createDocumentFragment()
}

function addClass(node, klass) {
    if (!klass || !(klass = klass.trim())) {
        return
    }

    if (node.classList) {
        node.classList.add(klass)
    } else {
        const cur = " " + (node.getAttribute('class') || '') + " "
        if (cur.indexOf(' ' + klass + ' ') < 0) {
            node.setAttribute('class', (cur + klass).trim())
        }
    }
}

function removeClass(node, klass) {
    if (!klass || !(klass = klass.trim())) {
        return
    }

    if (node.classList) {
        node.classList.remove(klass)
    } else {
        const cur = " " + (node.getAttribute('class') || '') + " "
        if (cur.indexOf(' ' + klass + ' ') >= 0) {
            node.setAttribute('class', cur.replace(' ' + klass + ' ', '').trim())
        }
    }
}

export default {
    replaceOldWithNew,
    appendChildToParent,
    getParentNode,
    getNextSibling,
    getPreviousSibling,
    getTextContent,
    setTextContent,
    getAttributeNames,
    getAttribute,
    setAttribute,
    getNodeType,
    getNodeName,
    removeNode,
    cloneNode,
    getFirstChild,
    // getChildNodes,
    insertNewBeforeOld,
    insertNewAfterOld,
    removeAttribute,
    createTextNode,
    setValue,
    setInnerText,
    setInnerHTML,
    addEventListener,
    createElement,
    createFragment,
    addClass,
    removeClass
}