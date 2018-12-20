一个正在施工中的canvas 2d游戏引擎的demo

进入游戏时，按D键进入主场景

主场景控制键为A、D、空格和J键

	A键向左
	D键向右
	空格跳跃
	J键放子弹

引擎实现的功能包括

1.节点树

	App为游戏的抽象
	Scenne为游戏场景的抽象
	Node为游戏节点的抽象

2.2d运动

	对节点执行包括Move、Scale、Rotate、Fade等动作

3.组件式的功能支持

	碰撞
	摄像机
	按键输入、
	多点触摸输入
	渲染
	pubsub
	状态管理
	......

4.多分辨率的自由支持

5.tilemap 2d地图支持

6.texturepacker支持

7.微信小游戏支持

8.ejecta支持