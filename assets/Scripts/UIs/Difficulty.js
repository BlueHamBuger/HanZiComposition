// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var DiffLevel = cc.Class({
    name:"DiffLevel",
    properties:{
        level_name:"",
        threshold:0,
    }
})

cc.Class({
    extends: cc.Component,

    properties: {
        difficultySelector:{
            default:null,
            type:cc.Slider,
        },
        difficultyLabel:{
            default:null,
            type:cc.Label
        },
        difficultyLevels:{
            default:[],
            type:[DiffLevel]
        }

    },
    initUI (uiMng) {
        this.uiMng = uiMng;
        this._updateLevel()

    },
    onSlide(){
        this._updateLevel()
        this.uiMng.gameMng.updateDifficulty(this.difficultySelector.progress)
    },
    getDifficulty(){
        return this.difficultySelector.progress
    },
    _updateLevel(){
        let progress = this.difficultySelector.progress
        this.difficultyLabel.node.color = cc.color(255*Math.pow(progress,1/2.2),0,0,255)
        for (const level of this.difficultyLevels) {
            if(progress<level.threshold){
                this.difficultyLabel.string = level.level_name + "("+parseFloat(progress).toFixed(2)+")"
                break;
            }
        }
    }
});
