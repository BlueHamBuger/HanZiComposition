// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

module.exports={
        //通用变量
    MatrixPlace: {
        Left:cc.v2(1,0),
        Right:cc.v2(1,2),
        Top:cc.v2(0,1),
        Bottom:cc.v2(2,1),
        TopLeft:cc.v2(0,0),
        TopRight:cc.v2(0,2),
        BottomLeft:cc.v2(2,0),
        BottomRight:cc.v2(2,2),
    },
    getByV2(matrix,v2slice){
        if(v2slice.x!=null){
            return matrix[v2slice.x][v2slice.y];
        }else{
            return matrix[v2slice[0]][v2slice[1]];
        }

    },
    isValidIdx(i,j,i_length,j_length){
        return i>=0&&i<i_length && j>=0  && j<j_length
    },


    // 九宫格矩阵操作：

    // 获取结点位置 在 一个3*3 矩阵中的邻接的两个结点位置
    GetAdjpos(posMat,pos){
        var exist=false;
        //判断pos是否在 矩阵中
        for(let i in posMat)
            for(let j in posMat[i])
                if(pos.equals(posMat[i][j]))
                    exist=true;
        if(!exist) 
            throw Error("指定的 pos 不在 posMat中");

        var dir=pos-posMat[1][1]; 
        //计算邻接点
        if(dir.x!=0&&dir.y!=0)
            return [cc.v2(1,pos.y),cc.v2(pos.x,1)];
        else{
            if(pos.x==1)
                return [cc.v2(pos.x-1,pos.y),cc.v2(pos.x+1,pos.y)];
            else
                return [cc.v2(pos.x,pos.y-1),cc.v2(pos.x,pos.y+1)];
        }
    },
    // 从 相对矩阵 到绝对矩阵位置
    GetActualPos(center,relativePos){
        return center.add(relativePos.sub(cc.v2(1,1)));
    },

    PosToString(pos)
    {
        return 'p'+pos.x+'_'+pos.y;
    },

    TranverseMatrix(height,width,func){
        for(let i=0;i<height;i++){
            for(let j=0; j<width;j++){
            }
        }
    },
    getIndex(array,element,cmp){
        for(var i=0;i<array.length;i++){
            if(array[i][cmp](element)){
                return i;
            }
        }
        return null;
    }

}