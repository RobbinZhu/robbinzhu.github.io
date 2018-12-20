const size = {
    width: -1,
    height: -1,
    scaleRatio: -1
}

function resize(canvas) {
    const scaleRatio = window.devicePixelRatio
        // console.log('resize', scaleRatio)

    let fullWidth = window.innerWidth
    let fullHeight = window.innerHeight

    // console.log(fullWidth, fullHeight)
    canvas.style.width = fullWidth + 'px'
    canvas.style.height = fullHeight + 'px'
    fullWidth *= scaleRatio
    fullHeight *= scaleRatio
    fullWidth |= 0
    fullHeight |= 0
    canvas.width = fullWidth
    canvas.height = fullHeight
    size.width = fullWidth
    size.height = fullHeight
    size.scaleRatio = scaleRatio
    return size
}
export default resize