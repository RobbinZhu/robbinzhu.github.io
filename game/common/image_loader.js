// import Promise from './promise.js'

let caches = []
let loaded = []

function load(url) {
    if (!caches[url]) {
        caches[url] = new Promise(function(resolve, reject) {
            const img = new Image
            img.src = url
            img.onload = function() {
                resolve(this)
                loaded[url] = this
                this.onload = null
            }
        })
    }
    return caches[url]
}

function get(url) {
    return loaded[url]
}

function clear() {
    loaded = []
    caches = []
}

export default {
    load,
    get,
    clear
}