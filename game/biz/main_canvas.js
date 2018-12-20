let mainCanvas

function getCanvas() {
    if(mainCanvas) {
        return mainCanvas
    }
    if (mainCanvas === undefined) {
        mainCanvas = window.canvas || document.getElementById('canvas')
    }
    if (!mainCanvas) {
        mainCanvas = document.createElement('canvas')
        document.body.appendChild(mainCanvas)
    }
    mainCanvas.setAttribute('tabindex', '1')
    // mainCanvas.focus()
    return mainCanvas
}
export default getCanvas