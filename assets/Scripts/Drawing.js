// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,


    properties: {
        stdDistance: {
            default: 20,
        },
        stdScale: {
            default: 3.0,
        },
        inputMng: {
            default: null,
            type: require("./Manager/InputManager"),
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.graphics = this.node.getComponent(cc.Graphics);
        this.canvas = this.node.parent;
        this.lastPos = null;
        this.drawScale = 1.0;
        this.points = [];
        this.PathOffsets = [];
        this.checkPoints = [];


        this.distance = [];
        this.curScale = this.stdScale;
        this.formerDist = 1.0;

    },
    updateScale(dist) {
        var deltaDist = this.stdDistance - dist;
        var scale = this.stdScale + deltaDist * this.stdDistance * 0.01;
        if (scale < this.stdScale * 0.4) {
            scale = this.stdScale * 0.4;
        }
        return scale;
    },
    fsmooth(a, b, ratio) {
        return a + (b - a) * (Math.sin(Math.PI * ratio - Math.PI / 2.0) + 1.0) / 2.0
    },
    OnTouchMove(event) {
        var mPos = event.getLocation();
        mPos = this.node.convertToNodeSpace(mPos)
        var points = this.graphics._impl._points;
        var DetectRect = new cc.Rect(mPos.x, mPos.y, 30.0, 30.0);
        for (let i = 0; i < points.length - 5000; i += 100) {
            if (DetectRect.contains(points[i])) {
                var targetIndex = i;
                break;
            }
        }
        if (targetIndex) {
            for (let i = 0; i < this.checkPoints.length; i++) {
                if (targetIndex >= this.checkPoints[i].index) {
                    this.curScale = this.checkPoints[i].scale;
                    this.checkPoints.length = i + 1;
                    break;
                }
            }
            this.ErasePath(targetIndex);
            var tarP = points[this.graphics._impl._pointsOffset - 50];
            var erasedPos = new cc.Vec2(tarP.x, tarP.y);
            this.points[0] = erasedPos;
            erasedPos = this.node.convertToWorldSpaceAR(erasedPos);
            this.points.length = 1;
            this.distance[0] = 0;
            this.distance.length = 1;
        } else {
            this.Draw(mPos);
        }
        return erasedPos;
        //this.inputMng.OnBoardTouch(event,erasedPos);
    },
    //绘图相关
    ResetDrawing(event) {
        this.points.length = 0;
        this.distance.length = 0;
        this.checkPoints.length = 0;
        this.graphics.clear();
        this.curScale = this.stdScale;
    },
    Draw(mPos) {
        // if(Math.abs(mPos.x)>= this.canvas.width/2.1 || Math.abs(mPos.y) >=this.canvas.height/2.1){
        //     //this.ResetDrawing();
        //     this.node.emit(cc.Node.EventType.TOUCH_CANCEL);
        //     return;
        // }
        if (this.points.length == 0) {
            this.distance.push(0.0);
        } else {
            this.distance.push(mPos.sub(this.points[this.points.length - 1]).mag());
        }
        this.points.push(mPos);
        if (this.points.length == 4) {
            //this.checkPoints

            var temp1 = this.points[1];
            //var temp2 = this.points[2];
            var middle = this.points[0].add(this.points[2]).div(2);
            this.points[1] = this.points[1].sub(middle).mul(1.5).add(middle);
            middle = temp1.add(this.points[3]).div(2);
            this.points[2] = this.points[2].sub(middle).mul(2.1).add(middle);
            //this.graphics.moveTo(this.points[0].x,this.points[0].y);
            var dist = this.distance[3] + this.distance[2] + this.distance[1];
            //距离长的 会使用 更多的拐点 来 模拟 三次贝塞尔曲线
            var num = dist / 3.0;
            if (num < 20) num = 20;
            var rate = (dist / this.formerDist) > 1.0 ? 1.0 : dist / this.formerDist;
            var scale = this.updateScale(dist * rate);
            // 起始点不从0 开始 保证线条起始位置 木有 毛刺
            for (let index = 1; index < num / 1.50; index++) {
                var t1 = (1.0 / num) * index;
                var target = this.points[0].mul(Math.pow(1.0 - t1, 3)).add(
                    this.points[1].mul(3 * t1 * Math.pow(1.0 - t1, 2)).add(
                        this.points[2].mul(3 * t1 * t1 * (1.0 - t1)).add(
                            this.points[3].mul(Math.pow(t1, 3))
                        )));
                var smoothScale = this.fsmooth(this.curScale, scale, t1 * rate);
                this.graphics.circle(target.x, target.y, smoothScale);
            }
            this.PathOffsets.push(this.graphics._impl._pathOffset);
            this.graphics.fill();
            // 控制最小的 绘画距离
            if (dist >= 15.0) {
                this.formerDist = dist;
                this.curScale = smoothScale;
            }
            this.points[0] = target;
            this.points[1] = this.points[3];
            this.distance[0] = this.distance[2];
            this.distance[1] = this.distance[3];
            this.points.length = 2;
            this.distance.length = 2;

            // 获取当前的 点的位置
            this.checkPoints.push({
                index: this.graphics._impl._pointsOffset - 1,
                scale: this.curScale
            });
        }
    },
    ErasePath(targetIndex) {
        var impl = this.graphics._impl;
        // 一次要擦除的点的 数量
        var dist = impl._pointsOffset - targetIndex;
        var subr = 0;
        var pathDist = 0;
        for (let i = 0; i < impl._pathLength; i++) {
            subr += impl._paths[impl._pathLength - 1 - i].points.length;
            if (subr >= dist) {
                pathDist = i + 1;
                break;
            }
        }
        impl._pointsOffset -= dist;
        impl._points.length = impl._pointsOffset;


        impl._pathLength -= pathDist;
        impl._paths.length = impl._pathLength;
        impl._curPath = impl._paths[impl._pathLength - 1];

        impl._pathOffset = 0;
        impl._dataOffset = 0;
        let datas = impl._renderDatas;
        for (let i = 0, l = datas.length; i < l; i++) {
            let data = datas[i];
            let meshbuffer = data.meshbuffer;
            meshbuffer.reset();
        }
        this.graphics.fill();
    }
});