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
        hintNode:{
            default:null,
            type:cc.Node,
        },
        resultNode:{
            default:null,
            type:cc.Node,
        },
        checkerPref:{
            default:null,
            type:cc.Prefab,
        }
    },
    initUI (uiMng) {
        this.uiMng = uiMng;
        this.resultLabel = this.resultNode.getComponentInChildren(cc.Label);    
        this.resultLabel.string = "  ";
        this.hintLayout = this.hintNode.getComponent(cc.Layout);
        //存储 提示汉字的列表
        this.hintLabels = [];
    },
    updateHints(hintArray){
        var Ynum = hintArray.length;
        var Xnum = hintArray[0].length;
        for (var i =0;i<hintArray.length;i++){
            if(Xnum<hintArray[i].length){
                Xnum=hintArray[i].length;
            }
        }
        if(Xnum*Ynum ==1) {
            this.hintNode.destroyAllChildren();
            this.hintLabels.length = 0;
        }
        //var total = Ynum*Xnum;
        var sizeX = this.hintNode.width/Xnum;
        var sizeY = this.hintNode.height/Ynum;
        this.hintLayout.cellSize.width = sizeX;
        this.hintLayout.cellSize.height = sizeY;
        for(var y = 0;y<Ynum;y++){
            if(this.hintLabels[y]==null)
                this.hintLabels[y]=[];
            for(var x=0;x<Xnum;x++){
                if(this.hintLabels[y][x]==null){
                    var newNode = new cc.Node();
                    newNode.color = cc.Color.BLACK;
                    this.hintLabels[y][x] = newNode.addComponent(cc.Label);
                    //this.hintNode.addChild(newNode);
                    this.hintNode.insertChild(newNode,y*Xnum+x);
                }
                this.hintLabels[y][x].string = hintArray[y][x]?hintArray[y][x]:"  ";
                var size = Math.min(sizeX,sizeY);
                this.hintLabels[y][x].fontSize = size/1.2;
                this.hintLabels[y][x].lineHeight = size/1.2;
            }
        }
    },
    updateHintResult(result){
        this.resultNode.getComponentInChildren(cc.Label).string = result;
    },
    ClearHints(){
        this.hintNode.destroyAllChildren();
        this.hintLabels.length = 0;
        this.resultNode.getComponentInChildren(cc.Label).string = "  ";
    }

});
