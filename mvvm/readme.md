这是一个基于Object.defineProperty实现的，实验性质的非Virtual Dom的MVVM框架

目前初步实现的功能有：

1.双向绑定

借鉴Vue的绑定思想，对Object和数组分开处理

以下为已实现的模版中可使用的语法

	:bind
	:model
	:text
	:show
	:if
	:for
	:class
	:html
	:style
	事件绑定 :on-
	自定义属性绑定 :

2.组件Component


未完成的有：

1.数据清理

	一个合格的MVVM框架应该考虑到内存的释放、重用，当一个元素从数组中被删除、对象中的一个属性被重新赋值时，对应的内存与dom的处理需要考虑清晰

	由于双向绑定的基础在于“数据监听与变化通知”，因此，必须有地方同时存储了数据与监听者双方，这也就是一个Watcher的大致功能

	模版编译后，会生成渲染方法

	一个模块第一次渲染时，会调用渲染方法，当这个渲染方法中使用了我们定义的语法读取一条数据时，就表明它应该与这条数据有关联，并且，需要在该数据改变时被通知到，以改变dom中的值

	这就是一个Watcher的大致思路

	比如我们有如下的数据
	const rabbit = {
		color: 'white'
	}

	以及这样的模版
	<div>{{rabbit.color}}</div>

	我们会将rabbit以Object.defineProperty改造成以下形式，屏蔽默认的color属性

	const listener = new DataListener(rabbit.color)
	Object.definedProperty(rabbit, 'color', {
        enumerable: true,
        configurable: true,
		get: function() {
			return listener.getValue()
		},
		set: function(value) {
            listener.setValue(value)
        }
	})

	而我们的模版，大致会编译成以下形式
	function render(__scope__) {
		with(__scope__) {
			try {
				return color
				//此处的数据读取会调用上面定义的rabbit的color属性
				//而不是rabbit这个json对象的默认color属性
			} catch(e) {
				console.error(e)
			}
		}
	}
	当我们渲染时，将rabbit对象作为参数传入，即可获得对应的数据
	const dataRead = render(rabbit)
	
	然后,我们使用dom.innerText或dom.textContent更新dom内容

	这样，一条简单的数据读取并渲染到dom的路径就走通了

	我们下面看一下DataListener这个对象，明显它的里面会有很多魔法

	new DataListener(***)

	DataListener.getValue

	DataListener.setValue

	可以简单认为，DataListener对象的作用，是将数据封存起来，然后以对象的访问属性的方式对外暴露数据的读写方法

	比如我们在某个地方使用rabbit.color = 'grey'将color的值改变时，就会调用到DataListener.setValue方法，在这个方法中，我们将内部的color值改变，并且通知dom做出更新

	如何通知dom？

	前面我们知道，当模版渲染时，我们的模版语法最终会变成对象(rabbit)的属性(color)调用，那么，如果我们将这次调用时，会改变内容的那个dom元素存储起来，就可以在后面，当rabbit的color值改变时，通知到对应dom

	这也是Watcher存在的一个理由
	
	我们使用一个全局的Watcher，存储dom元素，存储dom的更新方法，比如这个例子中我们使用的是dom.innerText

	待补充

2.其他功能点的添加

###Demo

以下是一个使用这个简陋的MVVM小框架，做的一个todolist demo

以及使用vue.js实现类似功能的todolist demo

当点击按钮添加时

每一帧，在数组的任意位置，添加一条数据，直到数组有1000条数据时停止

1.记录两种方案所消耗的时间

2.使用devtools的Performance记录浏览器执行这一任务时在脚本运行、渲染、帧率等方面的不同表现
