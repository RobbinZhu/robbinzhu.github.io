import Base from './base.js'

class TouchBase extends Base {
    constructor() {
        super()
        this.resetTouchEvents()
    }
    resetTouchEvents() {
        this.interactMask = 0
        this.touchdown =
            this.mousedown =
            this.mouseup =
            this.mousemove =
            this.mouseover =
            this.mouseout =
            this.mouseenter =
            this.mouseleave =
            this.keydown =
            this.keyup =
            this.keypress = null
        return this
    }
    supportTouch() {
        this.interactMask |= 1
    }
    supportMouse() {
        this.interactMask |= 2
    }
    supportKeyboard() {
        this.interactMask |= 4
    }
    performEvents(session, camera) {
        if (this.interactMask & 1) {
            const touchEvents = session.domEvent.getTouchEvents()
            if (this.touchdown && !this.touchdown(touchEvents, session, camera)) {
                // break
            }
        }
        if (this.interactMask & 2) {
            const mouses = session.domEvent.getMouseEvents()
            for (let i = 0, j = mouses.length; i < j; i++) {
                const mouse = mouses[i]
                if (this[mouse.type] && !this[mouse.type](mouse, session, camera)) {
                    // break
                }
            }
        }
        if (this.interactMask & 4) {
            if (this.keydown) {
                this.keydown(session.domEvent.getKeyEvents(), session, camera)
            }
        }
        return this
    }
}
export default TouchBase