// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var CheckerManager = require("CheckerManager");
var CompositionManager = require("CompositionManager");

// 全局变量定义
window.CheckerType = {
    Normal: 0,
    Edit: 1,
    // 空 爆炸后的残余
    Empty: 2,
}
window.CheckerState = {
    Normal: 0,
    Selected: 1,
}

cc.Class({
    extends: cc.Component,
    // editor:{
    //     executeInEditMode:true
    // },
    properties: {
        canvas: {
            default: null,
            type: cc.Node,
        },
        //ChecekrManager
        checkerBoard: {
            default: null,
            type: cc.Node,
        },
        checkerPref: {
            default: null,
            type: cc.Prefab,
        },
        emptyHanZi: {
            default: " ",
        },
        checkerAmount: {
            default: cc.v2(8, 8),
        },
        paddingRate: {
            default: cc.v2(0.05, 0.05),
        },
        spacingRate: {
            default: cc.v2(0.05, 0.05),
        },

        // ClinetManager
        IP: {
            default: "127.0.0.1",
        },
        port: {
            default: "8000",
        },
        renderCamera: {
            default: null,
            type: cc.Camera,
        },
        drawing: {
            default: null,
            type: cc.Node,
        },
        score: {
            visible: false,
            get: function() {
                if (!this.uiMng) return 0;
                return this.uiMng.score.value;
            },
            set: function(value) {
                this.uiMng.setScore(value);
            }
        },
        difficulty:{
            visible:false,
            default:0,
        }

    },
    start() {
        this.uiMng = this.initMng("UIManager", this.node);
        this.uiMng.initManager(this);
        this.compoMng = this.initMng("CompositionManager", this.node);
        this.resLoading()
        this.compoMng.loadRes(this.resComplete.bind(this))
        
        // this.postEffectMng = this.initMng("PostEffectManager",this.renderCamera.node);
        // this.postEffectMng.initManager(this,this.renderCamera);
    },
    initMng(name, obj) {
        var mng = obj.getComponent(name);
        if (mng != null) return mng;
        var mng = obj.addComponent(name);
        return mng;
    },
    //游戏状态相关
    startGame() {
        this.score = 0;
        this.compoMng.initManager(this,this.difficulty);

        this.inputMng = this.initMng("InputManager", this.checkerBoard);
        this.inputMng.initManager(this, this.drawing);

        this.checkerMng = this.initMng("CheckerManager", this.checkerBoard);
        this.checkerMng.initManager(this, this.checkerPref, this.checkerAmount, this.paddingRate, this.spacingRate, this.emptyHanZi);

        this.animMng = this.initMng("AnimationManager", this.node);
        this.animMng.initManager(this); 


    },
    exitGame() {
        if (this.animMng)
            this.animMng.destroy();
        //this.compoMng.destroy();
        if (this.checkerMng)
            this.checkerMng.destroy();
        if (this.inputMng)
            this.inputMng.destroy();
        this.node.targetOff(this.node);
    },
    pauseGame() {
        this.checkerMng.checkers.forEach(cks => {
            cks.forEach(ck => {
                ck.node.pauseAllActions();
            });
        });
        this.inputMng.inputable = false;
    },
    continueGame() {
        this.checkerMng.checkers.forEach(cks => {
            cks.forEach(ck => {
                ck.node.resumeAllActions();
            });
        });
        this.inputMng.inputable = true;
    },
    exchangeMode(){
        this.inputMng.exchange_mode = !this.inputMng.exchange_mode
    },
    updateDifficulty(difficulty){
        //this.compoMng.updateDifficulty(difficulty)
        this.difficulty = difficulty
    },
    //资源载入
    resComplete(){
        this.uiMng.onLoadingOver()
    },
    resLoading(){
        this.uiMng.onLoading()
    }




});