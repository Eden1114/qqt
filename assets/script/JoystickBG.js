var Common = require('JoystickCommon');

cc.Class({
    extends: cc.Component,

    properties: {
        dot: {
            default: null,
            type: cc.Node,
            displayName: '摇杆节点',
        },

        _joyCom: {
            default: null,
            displayName: 'joy Node',
        },

        _playerNode: {
            default: null,
            displayName: '被操作的目标Node',
        },

        _angle: {
            default: null,
            displayName: '当前触摸的角度',
        },

        _radian: {
            default: null,
            displayName: '弧度',
        },


        _speed: 0,          //实际速度
        _speed1: 3,         //一段速度
        _speed2: 5,         //二段速度
        _opacity: 128,        //透明度
    },


    onLoad: function () {

        // joy下的Game组件
        this._joyCom = this.node.parent.getComponent('Game');
        
        // game组件下的player节点
        this._playerNode = this._joyCom.sprite;

        if (this._joyCom.touchType == Common.TouchType.DEFAULT) {
            //对圆圈的触摸添加监听事件
            this._initTouchEvent();
        }
    },


    //对圆圈的触摸监听
    _initTouchEvent: function () {
        let self = this;

        self.node.on(cc.Node.EventType.TOUCH_START, this._touchStartEvent, self);
        self.node.on(cc.Node.EventType.TOUCH_MOVE , this._touchMoveEvent , self);

        // 触摸在圆圈内离开或在圆圈外离开后，摇杆归位，player速度为0
        self.node.on(cc.Node.EventType.TOUCH_END, this._touchEndEvent, self);
        self.node.on(cc.Node.EventType.TOUCH_CANCEL, this._touchEndEvent, self);

    },

    //更新移动目标
    update: function (dt) {
        switch (this._joyCom.directionType) {
            case Common.DirectionType.ALL:
                this._allDirectionsMove();
                break;
            default:
                break;
        }
    },

    /**
     * onKeyDown: function (e) {
        //在按下的时候设置方向标志位
        switch (e.keyCode) {
            case cc.KEY.up: { this._up = true; break }
            case cc.KEY.down: { this._down = true; break }
            case cc.KEY.left: { this._left = true; this.node.scaleX = -1; this.node.children[0].scaleX = -1; break }
            case cc.KEY.right: { this._right = true; this.node.scaleX = 1; this.node.children[0].scaleX = 1; break }
        }
    },

    onKeyUp: function (e) {
        //在弹起的时候解除方向标志位
        switch (e.keyCode) {
            case cc.KEY.up: { this._up = false; break }
            case cc.KEY.down: { this._down = false; break }
            case cc.KEY.left: { this._left = false; break }
            case cc.KEY.right: { this._right = false; break }
        }
    },
     * 
     * 
     */

    
    //全方向移动
    _allDirectionsMove: function () {
        let player = this._playerNode;
        let move_control = player.getComponent('move-control');

        let dx = Math.cos(this._angle * (Math.PI / 180)) * this._speed;
        let dy = Math.sin(this._angle * (Math.PI / 180)) * this._speed;
        
        // move_control.onAllDirectionMove(dx, dy);

        // console.log(this);
        // console.log(this._playerNode);
        //DEBUG
        // let manager = cc.director.getCollisionManager();
        // manager.enabled = true;
        // if (!this.realPlayer) {
        //     //计算玩家位置并不断追逐
        //     let targetVector = cc.pSub(this._player.position, this.node.position);
        //     let moveStep = cc.pMult(cc.pNormalize(targetVector), this.moveSpeed);
        //     if (moveStep.x > 0 && !!this._rightBlock) { moveStep.x = 0; }
        //     if (moveStep.x < 0 && !!this._leftBlock) { moveStep.x = 0; }
        //     if (moveStep.y > 0 && !!this._upBlock) { moveStep.y = 0; }
        //     if (moveStep.y < 0 && !!this._downBlock) { moveStep.y = 0; }
        //     if (moveStep.x > 0) { this.node.scaleX = 1; this.node.children[0].scaleX = 1; }
        //     if (moveStep.x < 0) { this.node.scaleX = -1; this.node.children[0].scaleX = -1; }
        //     this.node.position = cc.pAdd(this.node.position, moveStep);
        // } else {

        //     if (this._left && !this._leftBlock) { this.node.x -= this.moveSpeed }
        //     if (this._right && !this._rightBlock) { this.node.x += this.moveSpeed }
        //     if (this._up && !this._upBlock) { this.node.y += this.moveSpeed }
        //     if (this._down && !this._downBlock) { this.node.y -= this.moveSpeed }
        // }
    },

    //计算两点间的距离并返回
    _getDistance: function (pos1, pos2) {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2));
    },

    /*角度/弧度转换
    角度 = 弧度 * 180 / Math.PI
    弧度 = 角度 * Math.PI / 180*/
    //计算弧度并返回
    _getRadian: function (point) {
        this._radian = Math.PI / 180 * this._getAngle(point);
        return this._radian;
    },

    //计算角度并返回
    _getAngle: function (point) {

        var pos = this.node.getPosition();
        this._angle = Math.atan2(point.y - pos.y, point.x - pos.x) * (180 / Math.PI);
        return this._angle;
    },

    //设置实际速度
    _setSpeed: function (point) {
        //触摸点和遥控杆中心的距离
        var distance = this._getDistance(point, this.node.getPosition());

        //如果半径小于radius，为一段速度，否则为二段速度
        if (distance < this._radius) {
            this._speed = this._speed1;
        }
        else {
            this._speed = this._speed2;
        }
    },

    //开始触摸到屏幕
    _touchStartEvent: function (event) {
        // 获取触摸位置的世界坐标转换成圆圈的相对坐标（以圆圈的锚点为基准）
        var touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
        //触摸点与圆圈中心的距离
        var distance = this._getDistance(touchPos, cc.p(0, 0));
        //圆圈半径
        var radius = this.node.width / 2;
        // 记录摇杆位置，给touch move使用
        this._stickPos = touchPos;
        var posX = this.node.getPosition().x + touchPos.x;
        var posY = this.node.getPosition().y + touchPos.y;
        //手指在圆圈内触摸,控杆跟随触摸点
        if (radius > distance) {
            this.dot.setPosition(cc.p(posX, posY));
            return true;
        }
        return false;
    },

    //跟随移动
    _touchMoveEvent: function (event) {
        var touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
        var distance = this._getDistance(touchPos, cc.p(0, 0));
        var radius = this.node.width / 2;
        // 由于摇杆的postion是以父节点为锚点，所以定位要加上ring和dot当前的位置(stickX,stickY)
        var posX = this.node.getPosition().x + touchPos.x;
        var posY = this.node.getPosition().y + touchPos.y;
        if (radius > distance) {
            this.dot.setPosition(cc.p(posX, posY));
        }
        else {
            //控杆永远保持在圈内，并在圈内跟随触摸更新角度
            var x = this.node.getPosition().x + Math.cos(this._getRadian(cc.p(posX, posY))) * radius;
            var y = this.node.getPosition().y + Math.sin(this._getRadian(cc.p(posX, posY))) * radius;
            this.dot.setPosition(cc.p(x, y));
        }
        //更新角度
        this._getAngle(cc.p(posX, posY));
        //设置实际速度
        this._setSpeed(cc.p(posX, posY));

    },

    //触摸结束
    _touchEndEvent: function () {
        this.dot.setPosition(this.node.getPosition());
        this._speed = 0;
    },
});
