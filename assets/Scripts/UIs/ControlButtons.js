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
        startButton: {
            default: null,
            type: cc.Button
        },
        pauseButton: {
            default: null,
            type: cc.Button
        },
        playButton: {
            default: null, 
            type: cc.Button
        },
        exitButton: {
            default: null,
            type: cc.Button
        },
        dictButton: {
            default: null,
            type: cc.Button
        },
        searchButton: {
            default: null,
            type: cc.Button
        },
        descriptionButton: {
            default: null,
            type: cc.Button
        },
        exchangeButton:{
            default: null   ,
            type: cc.Button            
        },
        difficultyButton:{
            default: null   ,
            type: cc.Button            
        }
    },

    mainMenuButtons() {
        return [this.startButton, this.dictButton,this.difficultyButton,this.descriptionButton];
    },

    gameMenuButtons() {
        return [this.pauseButton, this.playButton, this.exitButton,this.exchangeButton,this.exchangeButton];
    },

    dictMenuButtons() {
        return [this.searchButton, this.exitButton];
    },
    descriptionButtons(){
        return [this.exitButton];
    },
    difficultyButtons(){
        return [this.exitButton];
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    }

    // update(dt) {},
});
