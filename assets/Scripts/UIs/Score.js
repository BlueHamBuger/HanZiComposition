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
        value: {
            default: 0,
            type: cc.Integer
        },
        curValue:{
            default:0,
            type: cc.Integer,
            visible:false
        }
    },
    initUI(uiMng){
        this.uiMng = uiMng;
        this.scoreLabel = this.node.getComponentInChildren(cc.Label);
        this.curInterval = null;
    },
    setTarValue(value){
        this.value = value;
        let dist = this.value - this.curValue;
        let interval = 1.0/dist; 
        if(!this.curInterval)
            clearInterval(this.curInterval);
        this.curInterval  = setInterval(this._addScore.bind(this),interval*1000);
    },
    _addScore(){
        if(this.curValue<this.value)
        {
            this.curValue++;
            this.scoreLabel.string = this.curValue.toString();
        }else{
            clearInterval(this.curInterval);this.curInterval = null;
        }
    },
    // LIFE-CYCLE CALLBACKS:

    //onLoad () {}

    // update (dt) {},
});
