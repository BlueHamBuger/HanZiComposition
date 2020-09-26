// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


var Help=require("Help");

cc.Class({
    extends: require("BaseManager"),
    
    ctor(){
        //保存 checker实例
        this.checkers=[];
        this.gameMng=null;
        this.checkerPref=null;
    },
    properties: {
        checkerAmount:{
            default:cc.v2(4,4),
        },
        paddingRate:{
            default:cc.v2(0.05,0.05),
        },
        spacingRate:{
            default:cc.v2(0.05,0.05),
        },
        checkerSize:{
            default:new cc.Vec2(),
        },
        emptyHanZi:{
            default:" ",
        }


    },
 
    initManager(gameMng,checkerPref,checkerAmount,paddingRate,spacingRate,emptyHanZi){
        this.gameMng=gameMng;
        this.checkerAmount=checkerAmount;
        this.checkerPref=checkerPref;
        this.paddingRate = paddingRate;
        this.spacingRate = spacingRate;

        //棋子属性
        this.emptyHanZi = emptyHanZi;
        this.initOpacity = 100;

        this.boundingBox = this.node.getBoundingBoxToWorld();

        // 棋子重用的 时候 的 每一列的对应出生位置的x左边
        this.insertPos = [];
        // 存储最高的位置的 y值
        this.topy = null;
        this.emptyCol = [];

        //布局初始化
        this.layout=this.node.getComponent(cc.Layout);
        this.layout.paddingTop=this.paddingRate.x*this.node.height;
        this.layout.paddingBottom=this.layout.paddingTop;
        this.layout.paddingLeft=this.paddingRate.y*this.node.width;
        this.layout.paddingRight=this.layout.paddingLeft;
        this.layout.spacingX=this.spacingRate.x*this.node.width;
        this.layout.spacingY=this.spacingRate.y*this.node.height;
        //设置 棋子的长宽 平铺到 棋盘上
        var checkerH= (this.node.height-2*this.layout.paddingBottom-(this.checkerAmount.y-1)*this.layout.spacingY)/this.checkerAmount.y;
        var checkerW= (this.node.width-2*this.layout.paddingRight-(this.checkerAmount.x-1)*this.layout.spacingX)/this.checkerAmount.x;
        this.checkerSize= cc.v2(checkerW,checkerW);
        this.layout.cellSize.width=checkerW;
        this.layout.cellSize.height=checkerH;
        //this.node.destroyAllChildren();
        this.ExplosionManager=Explosion.InitExplosion(this);        
        
        //持有 所有的棋子引用
        for(var i=0;i<Math.floor(this.checkerAmount.y);i++){
            this.checkers[i]=[];this.checkerState=[];
            for(var j=0;j<Math.floor(this.checkerAmount.x);j++){
                var checker= cc.instantiate(this.checkerPref);
                this.node.addChild(checker);checker.width = checkerW;checker.height = checkerH;
                this.checkers[i][j]=checker.getComponent("HanZiChecker");
                this.checkers[i][j].checkerMng=this;
                this.checkers[i][j].boardPos=cc.v2(i,j);
                if(this.emptyCol[j]==null) this.emptyCol[j]= [];
                this.emptyCol[j][i] = this.checkers[i][j];
            }
        }
        this.checkerLayout=[];
        this.scheduleOnce(this.lateInit.bind(this),0.1);
    },
    lateInit(){
        // 后期信息
        this.layout.enabled=false;
        this.topy = this.checkers[0][0].node.position.y+5.0;
        for(var height in this.checkers){
            this.checkerLayout[height] = [];
            for(var width in this.checkers[height]){
                this.checkerLayout[height][width] = this.checkers[height][width].node.position;

            }
        }
        this.ReShapeMatrix();
    },

    update(dt){
        // 没有被选中的  checker 将逐渐恢复
        this.checkers.forEach(cks => {
            cks.forEach(ck => {
                if(ck.state != CheckerState.Selected){
                    if(ck.Opacity>this.initOpacity){
                        ck.Opacity-=2;
                    }
                    if(ck.node.scale>1){
                        ck.node.scale -= dt;
                    }
                    //if(ck.Opacity<this.initOpacity) ck.Opacity = this.initOpacity;
                }
            });
        });
    },  

    // onLoad () {},

    // // 物理相关
    // setRigiAnim(animated){
    //     this.checkers.forEach(cks => {
    //         cks.forEach(ck => {
    //             if(ck.rigid == null) return;
    //             if(animated)
    //                 ck.rigid.type = cc.RigidBodyType.Animated;
    //             else{
    //                 ck.rigid.type = cc.RigidBodyType.Dynamic;
    //             }
    //         });
    //     });
    // },
    //发散矩阵 生成
        //pos是 扩散目标 的位置
        // 首先 要向数据库进行 访问 获取 组成汉字在matrix中的位置
        // 这将作为 汉字扩散的方向依据
    GetCompMatrix(pos,areaMask){
        if(!this.CheckPos(pos)) {
            throw cc.error("超出区域");
        }
        var checker = Help.getByV2(this.checkers,pos);
        return this.gameMng.compoMng.GetCompMatrix(checker.HanZi,areaMask);
    },

    //获取 queryStrings
    GetQuery(hanZi,pos,targetPos){
        if(!this.CheckPos(pos)) {
            throw cc.error("超出区域");
        }
        if(!this.CheckPos(targetPos)){
            return "";
        }
        var tarHanZi=Help.getByV2(this.checkers,targetPos).HanZi;
        var dir = targetPos.sub(pos);
        var queryStrings=this.gameMng.compoMng.StringProcess.getQueryString(dir,hanZi,tarHanZi);
        return queryStrings;
    },
    // 获取Query 用的矩阵
    GetResults(explodedQueue){
        return this.gameMng.compoMng.CompExplosionQueue(explodedQueue);
    },
    StoreChanges(changes){
        this.ExplosionManager.changeStore=this.ExplosionManager.changeStore.concat(changes);
    },
    ApplyChanges(changes){
        for(let key in changes){
            let c = changes[key];
            this.checkers[c.pos.x][c.pos.y].HanZi = c.hanZi;
        }
        changes.length = 0;
    },
    GetHanZi(pos){
        if(!this.CheckPos(pos)) {
            //return "";
            return this.emptyHanZi
        }
        return Help.getByV2(this.checkers,pos).HanZi;
    },
    SetHanZi(pos,HanZi){
        if(!(pos=this.CheckPos(pos))) {
           //Do Nothing
        }
        var ck = Help.getByV2(this.checkers,pos);
        if(HanZi === this.emptyHanZi){
            if(this.emptyCol[pos[1]]==null){
                this.emptyCol[pos[1]]=[];
            }
            this.emptyCol[pos[1]].push(ck);
        }
        ck.HanZi=HanZi;

    },
    CheckPos(pos){
        let tempPos = pos;
        if(pos.x!=null){
            tempPos =[];
            tempPos[0] = pos.x;
            tempPos[1] = pos.y;
        }
        if(tempPos[0]<0||tempPos[1]<0)
            return null;
        else if(tempPos[0]>=this.checkers.length||tempPos[1]>=this.checkers[0].length)
            return null;
        return tempPos;
    },
    GetChecker(actualPos){
        for(let i =0;i<Math.floor(this.checkerAmount.x);i++){
            for(let j =0;j<Math.floor(this.checkerAmount.y);j++){
                var bounding = this.checkers[j][i].node.getBoundingBoxToWorld();
                if(bounding.contains(actualPos)){
                    return this.checkers[j][i];
                }
            }
        }
        return null;
    },
    GetCheckerPosByIndex(index){
        var tempIndex =index
        if(index.x !=null){
            tempIndex= [] ;
            tempIndex[0] = index.x;
            tempIndex[1] = index.y;
        }
        if(this.CheckPos(tempIndex)){
            return this.checkers[tempIndex[0]][tempIndex[1]].node.position;
        }else{
            return null;
        }
    },
    // 组合 提交的 线段
    CompoRoute(route){
        if(route == null){
            return;
        }
        // 将索引位置全部转化为 绝对位置
            //{route:self.inPos,posHanZi:self.compoHanZis};
        var points = route.points;
        var compH = route.posHanZi;

        //var conveyedpoints = [];
        var conveyedCompH ={};
        var checkers = [];
        for(let key in points){
            let pos = points[key];
            let r = compH[pos.x+"_"+pos.y];
            if(r!=null){
                conveyedCompH[key] = r;
            }
            checkers[key] = Help.getByV2(this.checkers,pos);
        }
        this.gameMng.animMng.LinearCompAnim({checkers:checkers,keyPoint:conveyedCompH});
        
    },
    // 在 所有当前组合完毕之后 重组数组index
    ReShapeMatrix(){
        var fallingList =[];var fallingDists=[];
        //列优先遍历
            // 根据空信息 将 新checker 重新利用
                // 放置到 棋盘顶端 让其下落
        for(let j=0;j<this.checkers[0].length;j++){
            let curColempty =this.emptyCol[j]?this.emptyCol[j].length:0;
            if(curColempty == 0) continue;
            let curempty = 0;
            for(let i=this.checkers.length-1;i>=0;i--){
                let ck = this.checkers[i][j];
                if(ck.HanZi == this.emptyHanZi){
                    curempty++;
                    ck.boardPos.x = curColempty-curempty;
                    fallingList.push(ck);fallingDists.push(curColempty);
                    ck.node.position = cc.v2(this.checkerLayout[0][j].x,this.topy+this.checkerSize.y*curempty);
                }else if(curempty != 0){
                    ck.boardPos.x += curempty;
                    this.checkers[ck.boardPos.x][ck.boardPos.y]=ck;
                    fallingList.push(ck);fallingDists.push(curempty);
                }
            }
        }
        for(let  col in this.emptyCol){
            for(let row in this.emptyCol[col]){
                let curck = this.emptyCol[col][row];
                this.checkers[curck.boardPos.x][curck.boardPos.y] = curck;
                curck.initHanziByGraph();
            }
        }
        this.gameMng.animMng.fallOff(fallingList,fallingDists,this.checkerLayout);
        this.emptyCol.length =0;
    },
    setCheckerState(pos,state){
        if(!(pos = this.CheckPos(pos))){
            return;
        }
        this.checkers[pos[0]][pos[1]].state = state;
    },
    resetCheckerState(){
        this.checkers.forEach(cks => {
            cks.forEach(ck => {
                ck.state = CheckerState.Normal;
            });
        });
    },
    swap(posA,posB){ // 交换两个汉字
        var hanzi = this.checkers[posA.x][posA.y].HanZi;
        this.checkers[posA.x][posA.y].HanZi = this.checkers[posB.x][posB.y].HanZi;
        this.checkers[posB.x][posB.y].HanZi = hanzi;
    },
    onDestroy(){
        this.node.destroyAllChildren();
        this.layout.enabled =true
    },


});



var Explosion={

    //pos dir level 决定  
        // 爆炸使用的 areaMask
    createNew(pos,parentDir,level,parentExp){
        var self = this;
        //数据区
        var explosion={};
        explosion.ExpMng = this;
        explosion.pos=pos;
        explosion.level=level;    
        explosion.parentDir=parentDir;
        explosion.parentExp=parentExp;
        //初始_areaMask
        //矩阵的 mask 决定哪些位置需要哪些不要
        explosion._areaMask=null;
        if(parentExp==null){
            explosion._areaMask=self.AreaMasks[level];
        }
        else{
            explosion._areaMask=self.AreaMasks[level][self.checkerMng.gameMng.compoMng.StringProcess.dir2String(parentDir)];
        }
        // 连接结点的位置 的矩阵
        explosion.positionMatrix = function(){
            var matrix=[]
            for(var i = 0;i<3;i++){
                matrix[i]=[];
                for(var j =0;j<3;j++)
                {
                    matrix[i][j]=Help.GetActualPos(pos,cc.v2(i,j))
                }
            }
            return matrix;
        }();

        // 爆炸的组件矩阵
        explosion.compMatrix=self.checkerMng.GetCompMatrix(explosion.pos,explosion._areaMask);
        
        //父节点 引用区
        explosion.parentExp=parentExp;
        self.EnQueue(self._explosionQueue,explosion);

        ////函数

        // 爆炸函数，返回矩阵 表示对应位置的queryString
        explosion.Explode=function(){
            //TODO 爆炸之前和 相邻的 尚未被引爆的节点进行结合判断
            //var poses=self.GetAdjpos(explosion.parentExp.positionMatrix,explosion.pos);
            //queryString 矩阵
            var queryStringMat=[];
            for(var i =0;i<3;i++)
            {
                queryStringMat[i]=[];
                for(var j=0;j<3;j++)
                {
                    if(explosion._areaMask[i][j]==1){
                        
                        let pos =explosion.positionMatrix[i][j];
                        if(Help.getIndex(self.affectedPoses,pos,'equals')==null){
                            // getQuery　来获取　其　爆炸的时候　矩阵位置上的　query 字符串
                            queryStringMat[i][j]
                            =self.checkerMng.GetQuery(explosion.compMatrix[i][j],explosion.pos,
                                Help.GetActualPos(explosion.pos,cc.v2(i,j)));
                        }
                    }
                    else 
                        queryStringMat[i][j]=null;
                }
            }
            return queryStringMat;
        };
        return explosion
    },
    // 静态 成员
    InitExplosion(checkerMng){
        this.checkerMng=checkerMng;

        
        //爆炸队列 遍历完一层之后 进入下一层前
            // 将上一层引爆并 出列 上一层的所有 explsion 对象
            //空即 次轮 爆炸结束
        this._explosionQueue=[];
        // 保存所有将呗修改的 汉字的位置
        this.affectedPoses = [];
        //存储将要变化的汉字
        this.changeStore =[];
        //fireLevel 即为引爆使用的 level
        this._curLevel=3;
        this._fireLevel=3;

        
        return this;
    },
    EnQueue(queue,explosion){
        queue.push(explosion);
    },
    DeQueue(queue){
        return queue.shift();
    },
    StartExplode(pos){
        //起始爆炸 设置 dir为0,level设置为 _initLevel;
        var explsion=this.createNew(pos,null,this._fireLevel,null);
        this._Explode(this._fireLevel);
        //爆炸结束
    },
    _Explode(level=this._curLevel){
        var queueLength=this._explosionQueue.length;
        var explodedQueue=[]
        for(let i =0;i<queueLength;i++){
            let curExplode=this._explosionQueue[0];
            if(curExplode.level>=this._curLevel)
            {
                var explosion=this.DeQueue(this._explosionQueue);
                //var queryStringMat=explosion.Explode();
                this.EnQueue(explodedQueue,explosion);
            }else{
                break;
            }
        }
        this._curLevel=Math.floor(this._curLevel/2);

        //发送 explodedQueue 进行query 
            //等待响应
        //level 为0 则代表 不会 继续引爆
        var queryResults=this.checkerMng.GetResults(explodedQueue);
        if(level!=0){
            for(var i=0;i<queryResults.length;i++)
            {

                var parentExp=queryResults[i].explosion;
                for(var j=0;j<queryResults[i].affectedPos.length;j++){
                    var affectedPos=queryResults[i].affectedPos[j];
                    //创建新的 exp
                    var newExp=this.createNew(affectedPos,affectedPos.sub(parentExp.pos),Math.floor(parentExp.level/2),parentExp);
                }
            }        
        }
        
        //TODO 爆炸延迟
        var checkerNodes =[];
        for(let i=0;i<explodedQueue.length;i++){
            let exp = explodedQueue[i];
            checkerNodes.push(this.checkerMng.checkers[exp.pos.x][exp.pos.y].node);
        }
        var actions = this.checkerMng.gameMng.animMng.ExpQueueAnim(checkerNodes,explodedQueue,1.0);
        // actions[actions.length-1]=actions[actions.length-1].call(this._Explode,this);
        actions.forEach(ac => {
            ac.start();
        });

        if(this._explosionQueue.length!=0){
            setTimeout(this._goOnExp.bind(this),1100);
        }
        else{
            setTimeout(this._ExplodeEnd.bind(this),1100);
        }
    },
    _ExplodeEnd(){
        this._applyChange();
        this.checkerMng.ReShapeMatrix();
        this._explosionQueue.length =0;
        this.affectedPoses.length = 0;
        this._curLevel=this._fireLevel;
    },
    _goOnExp(){
        this._applyChange();
        this._Explode();
    },
    _applyChange(){
        if(this.changeStore.length!=0){
            this.checkerMng.ApplyChanges(this.changeStore);
        }
    },

    AreaMasks:[ 
        //level0
        {
            u:[[0,1,0],[0,0,0],[0,0,0]],
            b:[[0,0,0],[0,0,0],[0,1,0]],
            r:[[0,0,0],[0,0,1],[0,0,0]],
            l:[[0,0,0],[1,0,0],[0,0,0]],
            ur:[[0,0,1],[0,0,0],[0,0,0]],
            ul:[[1,0,0],[0,0,0],[0,0,0]],
            br:[[0,0,0],[0,0,0],[0,0,1]],
            bl:[[0,0,0],[0,0,0],[1,0,0]],
        },
        {
            u:[[0,1,0],[0,0,0],[0,0,0]],
            b:[[0,0,0],[0,0,0],[0,1,0]],
            r:[[0,0,0],[0,0,1],[0,0,0]],
            l:[[0,0,0],[1,0,0],[0,0,0]],
            ur:[[0,0,1],[0,0,0],[0,0,0]],
            ul:[[1,0,0],[0,0,0],[0,0,0]],
            br:[[0,0,0],[0,0,0],[0,0,1]],
            bl:[[0,0,0],[0,0,0],[1,0,0]],
        },
        // //level1
        // {
        //     u:[[1,1,1],[0,0,0],[0,0,0]],
        //     b:[[0,0,0],[0,0,0],[1,1,1]],
        //     r:[[0,0,1],[0,0,1],[0,0,1]],
        //     l:[[1,0,0],[1,0,0],[1,0,0]],
        //     ur:[[0,1,1],[0,0,1],[0,0,0]],
        //     ul:[[1,1,0],[1,0,0],[0,0,0]],
        //     br:[[0,0,0],[0,0,1],[0,1,1]],
        //     bl:[[0,0,0],[1,0,0],[1,1,0]],
        // },
        //level2
        {
            u:[[1,1,1],[1,0,1],[0,0,0]],
            b:[[0,0,0],[1,0,1],[1,1,1]],
            r:[[1,1,0],[1,0,0],[1,1,0]],
            l:[[0,1,1],[0,0,1],[0,1,1]],
            ur:[[1,1,1],[0,0,1],[0,0,1]],
            ul:[[1,1,1],[1,0,0],[1,0,0]],
            br:[[0,0,1],[0,0,1],[1,1,1]],
            bl:[[1,0,0],[1,0,0],[1,1,1]],
        },
        //level3
        [[1,1,1],[1,0,1],[1,1,1]],
        
    ]
    





}

