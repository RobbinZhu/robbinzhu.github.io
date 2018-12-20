import MVVM from './mvvm.js'
import Component from './component.js'

const sortFunc = [
    function() {
        return Math.random() - 0.5
    },
    function(a, b) {
        return a.id - b.id
    },
    function(a, b) {
        return b.id - a.id
    }
]

MVVM.component('go-fire', {
    data() {
        return {
            count: 0
        }
    },
    props: ['todos', 'newTodoText', 'addTime'],
    template: '<button :on-click="add()">You clicked me {{count}} times.</button>\
        start: {{addTime.start}} newTodoText: {{newTodoText}} todos.length {{todos.length}}\
        <br />',
    methods: {
        add() {
            this.count += 1

            // this.addTime.start = Math.random().toString().slice(2, 5)
            // this.newTodoText = Math.random().toString().slice(2, 5)

            this.todos[0].id = Math.random()
        }
    }
})


const vm = window.vm = MVVM.create({
    el: document.querySelector('#todo-list-example'),
    data() {
        return {
            newTodoText: '',
            todos: [{
                id: 1,
                title: 'Feed the cat',
                children: [{
                    name: 1
                }]
            }, {
                id: 2,
                title: 'Eat the cat',
                children: [{
                    name: 2
                }]
            }],
            nextTodoId: 3,
            timeStart: '',
            timeEnd: '',
            timeCost: '',
            addTime: {
                start: '',
                end: '',
                cost: ''
            },
            removeTime: {
                start: '',
                end: '',
                cost: ''
            }
        }
    },
    methods: {
        removeTo0() {
            this.removeTime.start = Date.now()
            this.removeTime.end = ''
            this.remove()
        },
        remove() {
            if (this.todos.length == 0) {
                this.removeTime.end = Date.now()
                this.removeTime.cost = this.removeTime.end - this.removeTime.start
                return
            }
            const index = (Math.random() * this.todos.length) | 0

            this.todos.splice(index, 1)
            requestAnimationFrame(() => {
                this.remove()
            })
        },
        addTo1000() {
            this.addTime.start = Date.now()
            this.addTime.end = ''
            this.add()
        },
        add() {
            if (this.todos.length == 1000) {
                this.addTime.end = Date.now()
                this.addTime.cost = this.addTime.end - this.addTime.start
                return
            }
            this.addNewTodo()
            requestAnimationFrame(() => {
                this.add()
            })
        },
        addNewTodo() {
            this.todos.splice((Math.random() * this.todos.length) | 0, 0, {
                id: this.nextTodoId++,
                title: Math.random().toString().slice(2, (Math.random() * 10) | 0),
                children: [{
                    name: Math.random().toString().slice(2, 6)
                }]
            })
        },
        sort(index) {
            this.todos.sort(sortFunc[index | 0])
        }
    }
})