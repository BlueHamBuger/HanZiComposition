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

//将 进行 query事件
// 进行 组合的 事件注册
cc.Class({
    extends:require("BaseManager"),
    ctor(){
        var HanZiCompDic={
            h日月:"明",
            v日月:"冒",
            v月月:"朋",
            h日日:"昍",
            v明明:"𣊧",
            v日日:"昌",
            h日昌:"晿",
            h昌昌:"𣊫",
        };
        var HanZiInverseCompDic={};
        for(let key in HanZiCompDic){
            HanZiInverseCompDic[HanZiCompDic[key]]=key;
        }
    },
    // 给予 要进行 引爆的 队列
    CompExplosionQueue(explosionQueue){
        var QueryResult=[];
        for(var i=0;i<explosionQueue.length;i++){
            var curExplosion=explosionQueue[i];
            curReturnInfo=this.CompExplosion(curExplosion);
            QueryResult.push(curReturnInfo);
        }
        return QueryResult;
    },

    // 进行 explode
    CompExplosion(explosion){
        var returnInfo={explosion:explosion,affectedPos:[]};
        var queryMat=explosion.Explode();
        for(let j=0;j<queryMat.length;j++){for(let k=0;k<queryMat[j].length;k++){
                if(explosion._areaMask[j][k]==0) continue;
                var curStrings=queryMat[j][k];
                for(var key in curStrings){
                    var compHanZi=this.HanZiCompDic[curStrings[key]];
                    if(compHanZi!=null){
                        returnInfo.affectedPos.push(Help.GetActualPos(curExplosion.pos,cc.v2(j,k)));
                        break;
                    }
                }
            }
        }
        return returnInfo;
    },
    GetCompMatrix(pos){
        var hanZi=this.gameManager.checkerMng.GetHanZi(pos);
        var compString=this.HanZiInverseCompDic[hanZi];
        //TODO 数据库访问 
            //获取组合 然后根据组合 形成矩阵
        var matrix=[];
        

        //暂时使用 单字扩散
        for(var i=0;i<3;i++){
            matrix[i]=[];
            for(var j=0; j<3;j++){
                if(i!=1||j!=1){
                    matrix[i][j]=hanZi;
                }
            }
        }
        return matrix;
    },

}
)
