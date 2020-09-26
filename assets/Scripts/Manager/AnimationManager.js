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
    extends: require("BaseManager"),

    ctor(){
        

    },
    properties: {
        testNode:{
            default:null,
            type:cc.Node,
        }
    },
    initManager(gameMng){
        this.gameMng=gameMng;
        this.checkerSize=this.gameMng.checkerMng.checkerSize;
        this.expNodePool = null;
        this.initExpPool();
        //使用线程池
    },
    // LIFE-CYCLE CALLBACKS:


    //画笔合并动画
        //route :{checkerNodes:checkers,keyPoint:compH}
    LinearCompAnim(route){
        var scoreRate=route.checkers.length;
        var ct=cc.tween;let cks = route.checkers;var kp = route.keyPoint;
        var kks = Object.keys(kp); var j = kks.length-1; 
        if(j<0) return;
        var finalPos = kks[j];
        var tweens = [];
        tweens[finalPos] = ct(cks[finalPos].node).call(this._SetHanZi,this,{pos:[cks[finalPos].boardPos.x,cks[finalPos].boardPos.y],hanZi:kp[finalPos]})
                                                 .call(this.gameMng.checkerMng.ReShapeMatrix,this.gameMng.checkerMng);
        for(var i=cks.length-2;i>=0;i--)
        {
            var ck = cks[i];scoreRate--;
            var curtween=(tweens[i]!=null)?tweens[i]:tweens[i]=ct(ck.node).call(
                    this._AddScore,this,scoreRate
            );
            var min = ((kks[j-1]!=undefined)?parseInt(kks[j-1]):0);
            var curTarPos = parseInt(kks[j]);
            if(i<curTarPos&&i>=min){
                if(i == min && i!=0){
                    curtween = curtween.call(this._SetHanZi,this,{pos:[ck.boardPos.x,ck.boardPos.y],hanZi:kp[min]})
                                       .delay(0.1);
                    j--;
                }
                for(var k=1;k<=curTarPos-i;k++){
                    curtween = curtween.to(0.3,{position:cks[i+k].node.position})
                }
                curtween = curtween.call(this._StartTweeen,this,tweens[i+1])
                                   .call(this._SetHanZi,this,{pos:[ck.boardPos.x,ck.boardPos.y],hanZi:this.gameMng.emptyHanZi});
            }
        }
        curtween.start();
    },
    _SetHanZi(node,info){
        this.gameMng.checkerMng.SetHanZi(info.pos,info.hanZi);
    },
    _StartTweeen(node,tween){
        tween.start();
    },
    _AddScore(node,s){
        this.gameMng.score = this.gameMng.score + Math.pow(2,s+1);
    },
    // 爆炸动画
    ExpQueueAnim(checkerNodes,explosions,lasttime){
        var actions = [];
        for(let key =0;key<checkerNodes.length;key++){
            let exp = explosions[key];
            let areaMask = exp._areaMask;
            var targetPosM = [];
            for(let i=0;i<areaMask.length;i++){
                targetPosM[i]=[];//DOTO 考虑 areaMask
                for(let j=0;j<areaMask[0].length;j++){
                    targetPosM[i][j] = this.gameMng.checkerMng.GetCheckerPosByIndex(exp.positionMatrix[i][j]);
                }
            }
            actions=actions.concat(this._ExpAnim(checkerNodes[key],targetPosM,exp.compMatrix,areaMask,lasttime,exp.ExpMng._fireLevel-exp.level+1));
        }
        return actions;
    },
    _ExpAnim(checkerNode,targetPosM,compMatrix,areaMask,lasttime,scoreRate){
        //areaMask  = [[1,1,1],[1,0,1],[1,1,1]];
        var expLabelMatrix=[];
        var center = [1,1];
        var actions = [];
        for(var i =0;i<areaMask.length;i++){
            expLabelMatrix[i]=[];
            for(var j=0;j<areaMask[i].length;j++){
                if(areaMask[i][j]==1){
                    var expNode = this.GetExpNode(checkerNode,[0.5,0.5]);                     
                    expLabelMatrix[i][j] = expNode.getComponent(cc.Label);
                    expLabelMatrix[i][j].string =compMatrix[i][j];
                    var byPos =new cc.Vec2(j-center[0],center[1]-i);
                    expNode.position=expNode.position.add(byPos.mul(10));
                    if(targetPosM[i][j]!=null){
                        var toPos = targetPosM[i][j].sub(checkerNode.position);
                        actions.push(cc.tween(expNode)
                            .to(lasttime,{position:toPos})
                            .call(this.expNodePool.put,this.expNodePool,expNode));
                    }else{
                    actions.push(cc.tween(expNode)
                        .by(lasttime,{position:byPos.mul(50)})
                        .call(this.expNodePool.put,this.expNodePool,expNode));
                    }
                }
            }
        }
        return actions;
    },
    GetExpNode(parentNode,scale){
        let expNode = null;
        if(this.expNodePool.size()>0){
            expNode = this.expNodePool.get();
        }else{
            expNode = new cc.Node();
            expNode.addComponent(cc.Label);
        }
        expNode.parent = parentNode;
        expNode.position= new cc.Vec2(0,0);
        expNode.scaleX=scale[0];expNode.scaleY=scale[1];
        return expNode;
    },
    initExpPool(){
        this.expNodePool =new cc.NodePool();
        let initCount = 27;
        for (let i = 0; i < initCount; ++i) {
            var node  = new cc.Node();
            node.color = cc.Color.BLACK;
            node.addComponent(cc.Label);
            this.expNodePool.put(node);   
        }
    },

    // 自由落体动画
    fallOff(checkers,fallingDists,checkerLayout){
        var ct = cc.tween;var maxTime=0.5;var decade = 0.2;var g =200;
        var tweens =[];
        for(var key  in checkers){
            let ck = checkers[key];
            let tarPos = checkerLayout[ck.boardPos.x][ck.boardPos.y];
            let curPos = ck.node.position;
            let nextPos = tarPos;
            let tw = ct(ck.node);
            if(tweens[key-1]!=null)
                tw = tw.call(this._StartTweeen,this,tweens[key-1]);
            let dist = nextPos.y -  curPos.y;
            let time =0;
            var r = (Math.random()-0.5)/25.0;// 为自由落体添加随机性
            time =Math.pow(Math.abs(dist)/g,0.5);
            time += time*r;
            tw = tw.by(time,{position:cc.v2(0,dist)},{easing:t=>t*t})
            let dir=-1;dist*=(decade*dir);
            do{
                r = (Math.random()-0.5)/10.0
                time =Math.pow(Math.abs(dist)/g,0.5);
                tw = tw.by(time+time*r,{position:cc.v2(0,dist)},{easing:t=>Math.pow(t,0.5)})
                        .to(time,{position:tarPos},{easing:t=>t*t});
                dist*=(decade*dir);
            }while(time>=0.1)
            tw = tw.to(0.1,{position:tarPos},{easing:t=>t*t});
            tweens.push(tw);
            //twstart();
            //this.gameMng.setInputable(true);}
        }
        tweens[key].call(function(){this.gameMng.node.emit('fallOver')},this).start();
    }

});
