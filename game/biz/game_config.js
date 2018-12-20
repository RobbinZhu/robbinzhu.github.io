export default {
    width: 1136,
    height: 768,
    maxWidth: 1136,
    maxHeight: 768,
    state: 'AppStateComponent',
    keyboards: 'ADJB ',
    scenes: [{
        name: 'intro',
        isMain: true,
        children: [{
            name: 'introText',
            width: 200,
            height: 200,
            x: 0,
            y: 0,
            anchorX: 0.5,
            anchorY: 0.5,
            relative: {
                x: 0.5,
                y: 0.5
            },
            // color: 'yellow',
            // pressColor: 'red',
            touchable: true,
            touchInput: 2,
            keyInput: ('D').charCodeAt(0),
            // type: 'Button',
            textures: [{
                image: '/img/levelMoon_hand.png'
            }],
            event: {
                name: 'navigate',
                param: 'game'
            },
            onUpdate: (function() {
                let add = true
                return function() {
                    const scale = this.spaceComponent.scale
                    if (scale.x > 1.2) {
                        add = false
                    } else if (scale.x < 0.5) {
                        add = true
                    }
                    scale.addxy(add ? 0.01 : -0.01, add ? 0.01 : -0.01)
                }
            })()
        }, {
            zIndex: -1,
            name: 'bg',
            width: '1',
            height: '1',
            x: 0,
            y: 0,
            anchorX: 0,
            anchorY: 0,
            textures: [{
                image: '/img/bg_night.jpg'
            }, {
                image: '/img/bg_night.jpg'
            }],
            type: 'Button',
            touchable: true,
            touchInput: 2,
            event: {
                name: 'navigate',
                param: 'game'
            },
        }]
    }, {
        name: 'game',
        hasCamera: true,
        tile: '/my_tile_data.json',
        // hasGridWorld: true,
        // gridWorldSize: [2000, 1000, 50, 20],
        state: 'SceneStateComponent',
        children: [{
            name: 'hero',
            width: 68,
            height: 100,
            x: 4000,
            y: 1000,
            anchorX: 0.5,
            anchorY: 0.5,
            color: 'red',
            cameraFollow: true,
            state: 'HeroStateComponent',
            textures: [{
                image: '/PlayerBlackCat.png'
            }]
        }, {
            name: 'frog',
            width: 48,
            height: 54,
            x: 4200,
            y: 1000,
            anchorX: 0.5,
            anchorY: 0.5,
            color: 'yellow',
            state: 'FrogStateComponent',
            textures: [{
                image: '/img/head_focus.png'
            }]
        }, {
            name: 'star',
            width: 20,
            height: 20,
            x: 4000,
            y: 1000,
            anchorX: 0.5,
            anchorY: 0.5,
            color: 'blue',
            onUpdate: function() {
                this.spaceComponent.rotation.add(0.02)
            }
        }, {
            name: 'touchLeft',
            width: 200,
            height: 100,
            x: 0,
            y: 0,
            anchorX: 0,
            anchorY: 1,
            color: '#ccddee',
            pressColor: 'red',
            zIndex: 999,
            notUseCamera: true,
            touchable: true,
            touchInput: 1,
            keyInput: ('A').charCodeAt(0),
            type: 'Button',
            relative: {
                x: 0,
                y: 1
            }
        }, {
            name: 'touchRight',
            width: 200,
            height: 100,
            x: 200,
            y: 0,
            anchorX: 0,
            anchorY: 1,
            color: '#ddeecc',
            pressColor: 'red',
            zIndex: 999,
            notUseCamera: true,
            touchable: true,
            touchInput: 2,
            keyInput: ('D').charCodeAt(0),
            type: 'Button',
            relative: {
                x: 0,
                y: 1
            }
        }, {
            name: 'touchJump',
            width: 200,
            height: 100,
            x: -200,
            y: 0,
            relative: {
                x: 1,
                y: 1
            },
            anchorX: 1,
            anchorY: 1,
            color: '#eeccdd',
            pressColor: 'red',
            zIndex: 999,
            notUseCamera: true,
            touchable: true,
            touchInput: 4,
            keyInput: (' ').charCodeAt(0),
            type: 'Button'
        }, {
            name: 'touchFire',
            width: 200,
            height: 100,
            x: 0,
            y: 0,
            relative: {
                x: 1,
                y: 1
            },
            anchorX: 1,
            anchorY: 1,
            color: '#ddccee',
            pressColor: 'red',
            zIndex: 999,
            notUseCamera: true,
            touchable: true,
            touchInput: 8,
            keyInput: ('J').charCodeAt(0),
            type: 'Button'
        }, {
            name: 'back',
            width: 69 * 2,
            height: 61 * 2,
            x: -100,
            y: 100,
            relative: {
                x: 1,
                y: 0
            },
            anchorX: 1,
            anchorY: 0,
            // color: 'red',
            touchable: true,
            touchInput: 16,
            keyInput: ('B').charCodeAt(0),
            notUseCamera: true,
            textures: [{
                image: '/img/btn_home_index_quit.png'
            }, {
                image: '/img/btn_home_index_quit.png'
            }],
            type: 'Button',
            event: {
                name: 'navigate',
                param: 'intro'
            }
        }, {
            zIndex: -100,
            name: 'bg2',
            width: 1136,
            height: 768,
            x: 0,
            y: 0,
            anchorX: 0,
            anchorY: 0,
            notUseCamera: true,
            textures: [{
                image: '/img/bg_moon.jpg'
            }],
            state: 'ParallaxStateComponent'
        }]
    }]
}