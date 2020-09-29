// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const Help = require("./Help");



//模块全局域
var EditName="HanZiEdit";
var HolderName="HanZiHolder";

var HanZiChecker=cc.Class({
    extends: cc.Component,
    ctor(){
        //私有
        this._hanZi="";
        //持有 label 和 editbox的引用
        this.HanZiHolder=null;
        this.EditBox=null;
        //记录 是否被引爆过
        this.exploded=false;
        //标识 棋子类型的变量
        this.checkerType=CheckerType.Normal;
        this.initOpacity = 100;
        this.state = CheckerState.Normal;
    },
    properties: {
        boardPos:{
            default : cc.v2(0,0),
        },
        checkerMng:{
            default : null,
            type : require("CheckerManager"),
        },
        Opacity:{
            get:function(){
                return this.node.opacity;
            },
            set:function(value){
                this.node.opacity = value;
            }
        },
        HanZi:{
            get:function(){
                return this._hanZi;
            },
            //set 汉字的同时要进行 设置label
            set:function(value){
                this._hanZi=value;
                if(this._hanZi!=this.checkerMng.emptyHanZi){
                    if(this.EditBox)
                        this.EditBox.node.active=false;
                    if(this.HanZiHolder){
                        this.HanZiHolder.node.active=true;
                        this.HanZiHolder.string=this._hanZi;
                    }
                }else{
                    if(this.EditBox){
                        this.EditBox.node.active=false;
                        this.EditBox.placeholder=this._hanZi;
                        this.EditBox.string="";
                    }
                    if(this.HanZiHolder){
                        this.HanZiHolder.node.active=false;
                    }
                }
            },
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        var minSize= Math.min(this.node.width,this.node.height)*0.75;
        //TODO
            //get HanZi here
        this.initComponnet(this.HanZi,minSize);
        ///this.initHanZi();
        this.HanZi = this.checkerMng.emptyHanZi;
        // 初始化 插入位置
        this.checkerMng.insertPos[this.boardPos.x] = this.node.position.x;
        // 最后一个。
        // if(this.boardPos.x == this.checkers.length-1&&this.boardPos.y == this.checkers[0].length){
        //     this.checkerMng.Re
        // }
    },

    // update(dt){
    //     if(this.state != CheckerState.Selected){
    //         this.Opacity-=3;
    //         if(this.Opacity <= this.checkerMng.initOpacity){
    //             this.Opacity = this.checkerMng.initOpacity; 
    //         }
    //     }
    // },

    


    // 组件初始化 将根据不同的汉字生成不同的组件
    initComponnet(hanZi,size){
        this.node.destroyAllChildren();
        // this.rigid = this.addComponent(cc.RigidBody);
        // this.rigid.fixedRotation = true;
        // this.boxCollider = this.addComponent(cc.PhysicsBoxCollider);
        // this.boxCollider.size.width = this.checkerMng.checkerSize.x;
        // this.boxCollider.size.height = this.checkerMng.checkerSize.y;
        // this.boxCollider.friction= 0;
        // this.boxCollider.apply();

        this.initHolder(hanZi,size);
        // if(this.gameMng){
        //     this.initEditBox(hanZi,size);
        //     if(hanZi!=this.checkerMng.emptyHanZi){
        //         this.EditBox.node.active=false;
        //     }else{
        //         this.HanZiHolder.node.active=false;
        //     }
        // }
    },
    // 初始化组件
    initHolder(hanZi,size){
        var holderChild = new cc.Node(HolderName);
        holderChild.parent=this.node;
        holderChild.color=cc.Color.BLACK;
        this.HanZiHolder=holderChild.addComponent(cc.Label);
        this.HanZiHolder.string=hanZi;
        this.HanZiHolder.horizontalAlign=cc.Label.HorizontalAlign.CENTER;
        this.HanZiHolder.verticalAlign=cc.Label.HorizontalAlign.CENTER;
        this.HanZiHolder.fontSize=size;
        this.HanZiHolder.lineHeight=size;
        
    },
    initEditBox(hanZi,size){
        var EditChild = new cc.Node(EditName);
        EditChild.parent=this.node;
        EditChild.color=cc.Color.GRAY;
    
        this.EditBox=EditChild.addComponent(cc.EditBox);
        this.EditBox.placeholder=hanZi;
        this.EditBox.fontColor=cc.Color.GRAY;
        this.EditBox.node.height=this.EditBox.node.width=size;
        this.EditBox.fontSize=size;
        this.EditBox.lineHeight=size;
        this.EditBox.placeholderFontSize=size;
        this.EditBox.maxLength=1;
        var placeholder=EditChild.getChildByName("PLACEHOLDER_LABEL").getComponent(cc.Label);
        placeholder.horizontalAlign=cc.Label.HorizontalAlign.CENTER;
        placeholder.verticalAlign=cc.Label.HorizontalAlign.CENTER;
    },
    // 汉字 的 初始化 
        //将从 基本汉字组件范围内  获取
    initHanZi(){
        this.initHanziByGraph()
        this.Opacity = this.checkerMng.initOpacity;
        this.node.scale =1;
        //TODO;
    },
    initHanZiRandom(){
        this.Opacity = this.checkerMng.initOpacity;
        this.node.scale =1;
    },
    initHanZiSimple(){
        let len = this.checkerMng.gameMng.compoMng.initCompList.length;
        //var r=Math.random()*len;
        this.HanZi = "口";
    },
    initHanziByGraph(){//使用 graph 来进行 初始化字符操作
        let ckmng = this.checkerMng
        let compoMng = this.checkerMng.gameMng.compoMng
        let graph = compoMng.HanZiGraph
        let hanzis = []//符合范围的 方向的索引
        let r= this.boardPos.x;let c = this.boardPos.y;
        let hanzi_d = ckmng.GetHanZi([r-1,c]),hanzi_u = ckmng.GetHanZi([r+1,c]),hanzi_l=ckmng.GetHanZi([r,c-1]),hanzi_r=ckmng.GetHanZi([r,c+1]);
        if(hanzi_d!=ckmng.emptyHanZi) hanzis.push(hanzi_d)
        if(hanzi_u!=ckmng.emptyHanZi) hanzis.push(hanzi_u)
        if(hanzi_r!=ckmng.emptyHanZi) hanzis.push(hanzi_r)
        if(hanzi_l!=ckmng.emptyHanZi) hanzis.push(hanzi_l)
        this.HanZi = graph.getHanZiByRelation(hanzis)

        // 根据 
        //if(this.boardPos.x > 0 && this.)

    },
    initTestHanZi(){
        var r=Math.random();
        if(r<=0.5) this.HanZi= "日";
        else this.HanZi= '月'
    },

});
