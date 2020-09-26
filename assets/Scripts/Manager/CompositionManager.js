// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

//var CheckerBoard = require("CheckerBoard");

var Help=require("Help");
const dirs = {LEFT:0,UP:1,RIGHT:2,DOWN:3}

//将 进行 query事件
// 进行 组合的 事件注册
cc.Class({
    extends:require("BaseManager"),
    ctor(){
        this.StringProcess = StringProcess
        this.HanZiGraph = HanZiGraph
        this.StringProcess.compoMng = this;
        this.initCompList=['日','月'];
        this.RedupinitList=['心','日','月','曰','水','火','犬','又','金','石','木','口','牛','刀']
        this.HanZiCompMDic={};
        this.InverseHanZiCompMDic={};
        cc.loader.loadRes('init(2)',function(err,json){
            if(err){
                cc.error(err.message);return;
            }
            this.initCompList = json.json;
        }.bind(this))
        cc.loader.loadRes('tt',function(err,json){
            if (err) {
                cc.error(err.message);
                return;
            }
            for(var key in json.json){
                var convey = key.replace(/\'/g,`"`)
                this.HanZiCompMDic[convey] = json.json[key];
            }
            console.log(this.HanZiCompMDic);
            for(var key in this.HanZiCompMDic){
                if(this.InverseHanZiCompMDic[this.HanZiCompMDic[key]]==null){
                    this.InverseHanZiCompMDic[this.HanZiCompMDic[key]] = [];
                }
                var compo_martrix = JSON.parse(key)
                HanZiGraph.insert(compo_martrix,key);
                // 展开数组
                this.InverseHanZiCompMDic[this.HanZiCompMDic[key]].push(compo_martrix);
            }
            HanZiGraph.sort()
            this.HanZiGraph.init()
        }.bind(this))
    },
    // 给予 要进行 引爆的 队列
    CompExplosionQueue(explosionQueue){
        var QueryResult=[];
        for(var i=0;i<explosionQueue.length;i++){
            var curExplosion=explosionQueue[i];
            //this.gameMng.checkerMng.SetHanZi(curExplosion.pos," ");
            var curReturnInfo=this.CompExplosion(curExplosion);
            QueryResult.push(curReturnInfo);
        }
        return QueryResult;
    },

    // 进行 explode
    CompExplosion(explosion){
        var returnInfo={explosion:explosion,affectedPos:[]};
        var queryMat=explosion.Explode();
        // 判断 是否进行了其它组合
        var exploded = false;
        // 存储要变换的汉字位置和汉字
        var changes = [];
        for(let j=0;j<queryMat.length;j++){for(let k=0;k<queryMat[j].length;k++){
                if(explosion._areaMask[j][k]==0) continue;
                var curStrings=queryMat[j][k];
                for(var key in curStrings){
                    var compHanZi=this.LinearQueueQuery(curStrings[key]);
                    //TODO 字体变换,告知 checker存储变换 信息
                    if(compHanZi.length!=0){
                        exploded=true;var actualPos=Help.GetActualPos(explosion.pos,cc.v2(j,k));
                        //汉字变换
                        changes.push({pos:actualPos,hanZi:compHanZi[0]});
                        returnInfo.affectedPos.push(actualPos);
                        explosion.ExpMng.affectedPoses.push(actualPos);
                        break;
                    }
                }
            }
        }
        // if(exploded||(explosion.level == explosion.ExpMng._fireLevel))
        // {
        cc.tween(this.gameMng.checkerMng.checkers[explosion.pos.x][explosion.pos.y].node)
        .to(0.8,{scale:1.5,opacity:255})
        .call(function(node,info){
            this.SetHanZi(info.pos,info.hanZi);
        },this.gameMng.checkerMng
        ,{pos:explosion.pos,hanZi:this.gameMng.checkerMng.emptyHanZi}).start()

        //this.gameMng.checkerMng.SetHanZi(explosion.pos,this.gameMng.checkerMng.emptyHanZi);
        this.gameMng.animMng._AddScore(null,explosion.ExpMng._fireLevel - explosion.level+1);
        //}
        this.gameMng.checkerMng.StoreChanges(changes);
        return returnInfo;
    },
    GetCompMatrix(hanZi,areaMask){// 用于进行汉字爆炸操作
        var compString=this.InverseHanZiCompMDic[hanZi];
        //获取组合 然后根据组合 形成矩阵
        var matrix=[];
        var width = (compString!=null&&compString.length!=0)?compString[0][0].length:1;
        var height = (compString!=null&&compString.length!=0)?compString[0].length:1;
        let inflag=false;
        for(let item of this.initCompList){
            if(item == hanZi){
                inflag=true;
            }
        }
        if(inflag||width*height==1){
            for(let i=0;i<3;i++){
                matrix[i]=[];
                for(let j=0; j<3;j++){
                    if(areaMask[i][j]!=0)
                        matrix[i][j]=hanZi;
                    }
            }
        }
        else{
            compString = compString[0];
            var compStringIndexX = 0;
            var compStringIndexY = 0;
            for(var i=0;i<3;i++){
                matrix[i]=[];
                for(var j=0; j<3;j++){
                    compStringIndexY =j;
                    if(areaMask[i][j] == 1)  {
                        if(compString[i] != null) compStringIndexX=i;
                        if(compString[compStringIndexX][j] == null){
                            for(let k = j;k>=0;k--){
                                if(compString[compStringIndexX][k]!=null){
                                    compStringIndexY = k;
                                    break;
                                }
                            }
                            for(let k=j;k<compString[compStringIndexX].length;k++){
                                if(compString[compStringIndexX][k]!=null){
                                    compStringIndexY = k;
                                    break;
                                }
                            }
                        }
                        matrix[i][j] = compString[compStringIndexX][compStringIndexY];
                    }
                    else 
                        matrix[i][j] = " ";
                }
            }    
        }

        return matrix;
    },
    //线性 问询 部分
    LinearQueueQuery(structMatrix){
        let structResults =[];
        let queryMats = [];
        var queryStrings = [];
        //别名准备
        for(let i =0;i<structMatrix.length;i++){
            structResults[i]=[];
            for(let j =0;j<structMatrix[i].length;j++){
                var hanZi = structMatrix[i][j];
                if(hanZi!=null){
                    structResults[i][j]=this.getAliases(hanZi);
                }
            }
        }
        //包含别名 进行查询 
        this._aliasQuery(queryMats,0,0,0,structResults)
        for(let i=0;i<queryMats.length;i++){
            queryStrings[i] = JSON.stringify(queryMats[i]);
        }
        var results =this.LienarQuery(queryStrings);
        return results
    },
    // 参数时 询问 martrix 和 左上角坐标
        // 使用该 query 表示 当前组合不正确
    LinearRegexQuery(structMatrix,left_up_pos){ // 按照regex 方式 进行查询
        let ck_mng = this.gameMng.checkerMng
        let query_que = []
        let first_col = null
        let col_num = structMatrix[0].length
        // 获取 第一个非空元素位置
        for(let i=0;i<structMatrix[0].length;i++){
            if(structMatrix[0][i] != null){
                first_col = i
                break
            }
        }

        let absolute_pos = left_up_pos.add(cc.v2(0,first_col))
        // 连接上下左右 形成矩阵
        var left = []
        for (const hanzis of structMatrix) left.push([...hanzis])
        let hanzi = ck_mng.GetHanZi(absolute_pos.add(cc.v2(0,-1)))
        if(first_col == 0){//左边无null
            for(let hanzis of left){
                hanzis.unshift(null)
            }
            left[0][0] = hanzi    
        }else
            left[0][first_col-1] = hanzi
        query_que.push(left)
        if(structMatrix.length == 1){// 最下边
            var down = []
            for (const hanzis of structMatrix) down.push([...hanzis])
            down.push([])
            for(let i =0;i<down[0].length;i++) down[1].push(null)
            down[1][first_col] = ck_mng.GetHanZi(absolute_pos.add(cc.v2(1,0)))
            query_que.push(down)
        }
        if(first_col == col_num-1){//右边
            var right = []
            for (const hanzis of structMatrix) right.push([...hanzis])
            for (let hanzis of right) {
                hanzis.push(null)
            }
            right[0][col_num] = ck_mng.GetHanZi(absolute_pos.add(cc.v2(0,1)))
            query_que.push(right)
        }
        //上边
        var up = []
        for (const hanzis of structMatrix) up.push([...hanzis])
        up.unshift([])
        for(let i =0;i<up[1].length;i++) up[0].push(null)
        up[0][first_col] = ck_mng.GetHanZi(absolute_pos.add(cc.v2(-1,0)))
        query_que.push(up)
        return 0
        // 将矩阵 转换为 regex
    },
    LienarQuery(queryStrings){
        var results = [];
        for(let i=0;i<queryStrings.length;i++){
            var result = this.HanZiCompMDic[queryStrings[i]];
            if(result){
                results.push(result);
            }
        }
        return results;
    },
    getAliases(hanZi){
        let queryString = "[[\""+hanZi+"\"]]";
        let results = this.LienarQuery([queryString]);
        return (results.length==0)?[hanZi]:[hanZi,results[0]];
    }
    ,
    _aliasQuery(queryMats,index,indexX,indexY,structResults){
        var xLength = structResults.length-1;
        var yLength = structResults[0].length-1;
        if(indexX == xLength+1) return;
        if(queryMats[index]==null){
            queryMats[index] = [];
        }
        if(queryMats[index][indexX]==null){
            queryMats[index][indexX]=[];
        }

        if(structResults[indexX][indexY] == null){
            queryMats[index][indexX][indexY] = "";
            if(indexY == yLength){
                this._aliasQuery(queryMats,index,indexX+1,0,structResults);
            }else{
                this._aliasQuery(queryMats,index,indexX,indexY+1,structResults);
            }
        }
        else if(structResults[indexX][indexY].length == 2){
            queryMats[index][indexX][indexY]=structResults[indexX][indexY][0];
            queryMats.push([]);
            var newIndex = queryMats.length-1;
            for(let i=0;i<queryMats[index].length;i++){
                queryMats[newIndex][i]=[];
                for(let j =0;j<queryMats[index][i].length;j++){
                    queryMats[newIndex][i][j] = queryMats[index][i][j];
                }
            }
            queryMats[newIndex][indexX][indexY]=structResults[indexX][indexY][1];
            if(indexY == yLength){
                this._aliasQuery(queryMats,index,indexX+1,0,structResults);
                this._aliasQuery(queryMats,newIndex,indexX+1,0,structResults);
            }else{
                this._aliasQuery(queryMats,index,indexX,indexY+1,structResults);
                this._aliasQuery(queryMats,newIndex,indexX,indexY+1,structResults);
            }
        }else{
            queryMats[index][indexX][indexY]=structResults[indexX][indexY][0];
            if(indexY == yLength){
                this._aliasQuery(queryMats,index,indexX+1,0,structResults);
            }else{
                this._aliasQuery(queryMats,index,indexX,indexY+1,structResults);
            }
        }
    },

   
})



var GuassianRandom = cc.Class({
    __ctor__(sita,u,radius){
        this.sita = sita
        this.u = u
        this.radius = radius
        this.gaussian_interval = []
        this.initIntervals()
    },
    initIntervals(){
        let total = 0
        let radius = this.radius
        for(let i =0;i<radius+1;i++){
            total += this._Guassian(i)
            this.gaussian_interval[i] = total
        }
        for(let i =0;i<radius;i++){
            this.gaussian_interval[i] /= this.gaussian_interval[radius]
        }
        this.gaussian_interval.pop()
    },
    _Guassian(x){
        let u = this.u
        let sita = this.sita
        return 1/(Math.sqrt(2*Math.PI)*sita) * Math.exp(-(x-u)*(x-u)/(2*sita*sita))
    },
    getRandom(r){
        ///let r = Math.random()
        let result = 0
        for(let i =0;i<this.radius;i++){
            if(r<= this.gaussian_interval[i]){
                result = i
                break
            }
        }
        return result
    }

})

// 使用正则匹配？
// 为每一个 字符 定义 其 相关性 （ 加权图 ）
    // 并保存以其为 首字符 情况下 可以匹配的情况
// 
var HanZiGraph = cc.Class({
    __ctor__(hanzi){
        this.compoArr = []// 所有的以 该 hanzi 位首字符的 组合
        this.hanziSet = {} // 该字符 相连的结点
        this.sorted_hanzi = [] //排序后的hanzi
        this.degree = 0// 被引用的次数
        this.hanzi = hanzi
    },
    insert(compo_str){
        this.compoArr.push(compo_str)
    },
    connect(relatedHanzi_node){
        this.degree++
        if(this.hanziSet[relatedHanzi_node.hanzi] ==null) this.hanziSet[relatedHanzi_node.hanzi] = 0
        this.hanziSet[relatedHanzi_node.hanzi]++;
    },
    has_compo_regex(compo_martrix){ //将 矩阵转换成 regex 进行 对比

    },
    sort(){
        var set = this.hanziSet
        this.sorted_hanzi = Object.keys(set).sort(function(a,b){return set[b] - set[a]})
        var a = 1
    },
    statics:{
        graph:{},//存储所有的结点 的字典 方便快速查询字符
        sorted_arr:[],//按照degree 排序后的 所有字符数组
        gaussian:null,
        init(){//初始
            let hanzi_size = this.sorted_arr.length
            var that = HanZiGraph
            //that.gaussian = new GuassianRandom(hanzi_size/2,hanzi_size/5,hanzi_size)
            that.gaussian = new GuassianRandom(100,50,hanzi_size)
        },
        _isValidIdx(i,j,i_length,j_length){
            return i>=0&&i<i_length && j>=0  && j<j_length
        },
        _connectNodes(graph,hanziA,hanziB){
            if(graph[hanziA]==null) graph[hanziA] = new HanZiGraph(hanziA)
            if(graph[hanziB]==null) graph[hanziB] = new HanZiGraph(hanziB)
            graph[hanziA].connect(graph[hanziB])
        },
        _Guassian(x,sita,u){
            return 1/(Math.sqrt(2*Math.PI)*sita) * Math.exp(-(x-u)*(x-u)/(2*sita*sita))
        },
        insert(new_compo,compo_str){ // 插入 指定的 新 组合 输入为一个 矩阵
            var that = HanZiGraph
            var g = that.graph
            for(let i = 0; i < new_compo.length; i++){
                let hanzi = new_compo[0][i]
                if(hanzi != ''){
                    if(g[hanzi]==null) g[hanzi] = new HanZiGraph(hanzi)
                    g[hanzi].insert(compo_str)
                    break;
                }
            }
            let i_length = new_compo.length;let j_length = new_compo[0].length
            // 连接 node
            for (let i = 0; i < i_length; i++) {
                for(let j = 0;j < j_length;j++){
                    var cur_hanzi = new_compo[i][j]
                    if(cur_hanzi == '') continue
                    if(that._isValidIdx(i+1,j,i_length,j_length)&&new_compo[i+1][j]!='') that._connectNodes(g,cur_hanzi,new_compo[i+1][j])
                    if(that._isValidIdx(i-1,j,i_length,j_length)&&new_compo[i-1][j]!='') that._connectNodes(g,cur_hanzi,new_compo[i-1][j])
                    if(that._isValidIdx(i,j+1,i_length,j_length)&&new_compo[i][j+1]!='') that._connectNodes(g,cur_hanzi,new_compo[i][j+1])
                    if(that._isValidIdx(i,j-1,i_length,j_length)&&new_compo[i][j-1]!='') that._connectNodes(g,cur_hanzi,new_compo[i][j-1])
                }
            }
        },
        sort(){//排序 graph 和 graph 中的所有结点 使用插入排序
            var that = HanZiGraph
            var g = that.graph
            that.sorted_arr = Object.keys(that.graph).sort(function(a,b){return g[b].degree  - g[a].degree})
            // that.sorted_arr.sort(function(a,b){a.degree-b.degree})
            that.sorted_arr.forEach(hanzi => {
                g[hanzi].sort()
            });
        },
        getHanZiByRelation(hanzis){ 
            var that = HanZiGraph
            let rand_num = Math.random()*(hanzis.length+1)// 随机值
            let rand_frac = rand_num - hanzis.length //获取小数部分 作为之后的随机数
            if(rand_num < hanzis.length){//使用 周围结点
                // 随机选取 四个 可连接值
                let next_hanzi = []
                let amount = 4
                for (let i = 0; i < amount; i++) {
                    let node = that.graph[hanzis[Math.floor(Math.random()*hanzis.length)]]  
                    let r2 = Math.floor((that.gaussian.getRandom(Math.random())/that.sorted_arr.length)*node.sorted_hanzi.length)
                    next_hanzi.push(node.sorted_hanzi[r2])
                }
                return next_hanzi[Math.floor(Math.random()*amount)]
            }else{//使用 度
                let idx = that.gaussian.getRandom(rand_frac)
                return that.sorted_arr[idx]
            }

        }
    },
})

// var HanZiGraphNode = cc.Class({
//     __ctor__(hanzi){
//         this.dirs = [[],[],[],[]] // 存储上下左右的Graph结点
//                             // 内部元素 按照 频率从小到大排序
//         this.degree = 0// 被引用的次数
//         this.hanzi = hanzi
//     },
//     refresh(dir,next_node){
//         this.degree++;
//         var idx = this.dirs[dir].indexOf(next_node)
//         if(idx != -1) return
//         else this.dirs[dir].push(next_node)
//     },
//     statics:{
//         graph:{},//存储所有的结点 的字典 方便快速查询字符
//         sorted_arr:[],//按照degree 排序后的 所有字符数组
//         insert(hanzi,dir,next_hanzi){
//             var g = HanZiGraphNode.graph
//             var node = g[hanzi]
//             if(node == null){//不存在
//                 node = g[hanzi] = new HanZiGraphNode(hanzi)
//             }
//             var next_node = g[next_hanzi]
//             if(next_node == null) node[next_hanzi] = new HanZiGraphNode(next_hanzi)
//             node.refresh(dir,next_node)
//         },
//         sort(){

//         }
//     },
// })

var StringProcess = {
    compoMng:null,
    getQueryString:
    // dir 为 从 compoHanZi 指向 targetHanZi 的方向
    function(dir,compoHanZi,targetHanZi){
        var dirString=this.dir2String(dir);

        var queryStrings=[];
        // dirStirng 如果 为 对角线方向 那么 就是有两个元素 
            // 所以 判断length
        for(let i=0;i<dirString.length;i++){
            if(dirString[i]=='u'){
                queryStrings[i]= [[targetHanZi],[compoHanZi]];
            }else if(dirString[i]=='l'){
                queryStrings[i]= [[targetHanZi,compoHanZi]];
            }else if(dirString[i]=='b'){
                queryStrings[i]= [[compoHanZi],[targetHanZi]];
            }else if(dirString[i]=='r'){
                queryStrings[i]= [[compoHanZi,targetHanZi]];
            }
        }
        // let compHanZiAlias = this.compoMng.getAliases(compoHanZi);
        // let targetHanZi = this.compoMng.getAliases()
        return queryStrings;
    },
    CheckHanZi:function(hanZi){
        if(hanZi==null)
        return false;
        //TODO 检查 字符的大小，unicode 中的范围
    },
    dir2String:function (dir){
        var dirString="";
        switch(dir.x){
            //上
            case -1:
                dirString +='u';
                break;
            //中
            case 0:
                break;
            //下
            case 1:
                dirString +='b';
                break;       
        }
        switch(dir.y){
            //右
            case 1:
                dirString +='r';
                break;
            //正
            case 0:
                break;
            //左
            case -1:
                dirString +='l';
                break;
        }
        return dirString;   
    },
}
