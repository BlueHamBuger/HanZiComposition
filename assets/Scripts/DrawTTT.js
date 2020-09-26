import ShaderMaterial from "./shader/ShaderMaterial";

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
        stdDistance:{
            default: 20,
        },
        stdScale:{
            default: 3.0,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.graphics = this.node.getComponent(cc.Graphics);
        this.canvas = this.node.parent;
        this.lastPos = null;
        this.drawScale = 1.0;
        this.allPoints = []
        this.points = [];

        this.distance = [];
        this.curScale =this.stdScale;
        this.formerDist = 1.0;

        this.node.parent.on(cc.Node.EventType.TOUCH_MOVE,function(event){
            var mPos  = event.getLocation();
            //mPos = this.node.convertToWorldSpaceAR(mPos);
            //mPos = mPos.sub(this.node.parent.position);
            mPos = this.node.convertToNodeSpace(mPos)
            if(Math.abs(mPos.x)>= this.canvas.width/2.1 || Math.abs(mPos.y) >=this.canvas.height/2.2){
                this.ResetDrawing();
                return;
            }
            if(this.points.length==0){
                this.distance.push(0.0);    
            }else{
                this.distance.push(mPos.sub(this.points[this.points.length-1]).mag());
            }

            this.points.push(mPos);
            this.allPoints.push(mPos);

            if(this.points.length==4){
                var temp1 = this.points[1];
                var temp2 = this.points[2];
                var middle = this.points[0].add(this.points[2]).div(2);
                this.points[1] = this.points[1].sub(middle).mul(1.5).add(middle);
                middle = temp1.add(this.points[3]).div(2);
                this.points[2] = this.points[2].sub(middle).mul(2.1).add(middle);
                this.graphics.moveTo(this.points[0].x,this.points[0].y);
                var dist  =this.distance[3]+this.distance[2]+this.distance[1];
                //距离长的 会使用 更多的拐点 来 模拟 三次贝塞尔曲线
                var num = dist/3.0;
                if(num<20) num = 20;
                var rate = (dist / this.formerDist)>1.0?1.0:dist/this.formerDist;
                var scale = this.updateScale(dist*rate);
                var deltaDist = dist/num;
                // 起始点不从0 开始 保证线条起始位置 木有 毛刺
                for (var index =1;index<num/1.50 ;index++){
                    var t1 = (1.0/num)*index;
                    var target = this.points[0].mul(Math.pow(1.0 - t1,3)).add(
                                this.points[1].mul(3*t1*Math.pow(1.0-t1,2)).add(
                                this.points[2].mul(3*t1*t1*(1.0-t1)).add(
                                this.points[3].mul(Math.pow(t1,3))
                                )));
                    var smoothScale = this.fsmooth(this.curScale,scale,t1*rate);
                    this.graphics.circle(target.x,target.y,smoothScale);
                }
                this.graphics.fill();
                if(dist>=15.0)
                {
                    this.formerDist = dist;
                    this.curScale = smoothScale;    
                }
                this.points[0] = target;
                this.points[1] = this.points[3];
                this.distance[0] = this.distance[2];
                this.distance[1] = this.distance[3];
                this.points.length = 2;
                this.distance.length = 2;
            }
        }.bind(this));
        this.node.parent.on(cc.Node.EventType.TOUCH_END,this.ResetDrawing.bind(this));
        this.node.parent.on(cc.Node.EventType.TOUCH_CANCEL,this.ResetDrawing.bind(this));
    },

    update (dt) {
    },

    updateScale(dist){
        var deltaDist = this.stdDistance - dist;
        var scale = this.stdScale + deltaDist*this.stdDistance*0.01;
        if(scale<this.stdScale*0.4){
            scale = this.stdScale*0.4;   
        }
        return scale;
    },  
    flerp(a,b,ratio){
        return a+(b-a)*ratio;
    },

    fsmooth(a,b,ratio){
        return a+(b-a)*(Math.sin(Math.PI*ratio-Math.PI/2.0)+1.0)/2.0
    },
    ResetDrawing(){
        this.points.length = 0;
        this.distance.length = 0;
        this.graphics.clear();
        this.curScale = this.stdScale;
    }
});
