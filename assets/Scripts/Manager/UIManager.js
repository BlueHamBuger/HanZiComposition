// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var Hints = require("../UIs/Hints");

cc.Class({
    extends: require('BaseManager'),

    // 状态
    //开始界面  
    // ———— this.gameMng.start()  //pause //exit //
    //开始 

    //暂停
    // 
    properties: {
        hints: {
            default: null,
            type: Hints,
        },
        controlButtons: {
            default: null,
            type: require('../UIs/ControlButtons')
        },
        score: {
            default: null,
            type: require('../UIs/Score')
        },
        playing: {
            default: true,
        },
        searchBoxNode: {
            default: null,
            type: cc.Node
        },
        results: {
            default: null,
            type: require('../UIs/Results')
        },
        resultsBoxNode: {
            default: null,
            type: cc.Node
        },
        descriptionBoxNode:{
            default: null,
            type: cc.Node            
        }
    },

    initManager(gameMng) {
        this.gameMng = gameMng;
        this.hints = cc.find('Canvas/UIs/HintUI').getComponent('Hints');
        this.hints.initUI(this);
        this.score.initUI(this);
        for (let button of this.controlButtons.mainMenuButtons()) {
            button.node.active = true;
        }
        for (let button of this.controlButtons.gameMenuButtons()) {
            button.node.active = false;
        }
        this.controlButtons.exchangeButton.node.rotation = 0
        this.score.node.active = false;
        this.hints.node.active = false;
        this.searchBoxNode.active = false;
        this.resultsBoxNode.active = false;
        this.descriptionBoxNode.active = false;
        this.controlButtons.descriptionButton.node.active = true;
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {
    // },


    // control ui
    startGame() {
        this.gameMng.startGame();
        this.controlButtons.startButton.node.active = false;
        this.controlButtons.dictButton.node.active =false;
        this.controlButtons.pauseButton.node.active = true;
        this.controlButtons.exitButton.node.active = true;
        this.score.node.active = true;
        this.hints.node.active = true;
        this.controlButtons.exchangeButton.node.active = true;
        this.descriptionBoxNode.active = false;
        this.controlButtons.descriptionButton.node.active = false;

    },

    pauseToggle() {
        this.controlButtons.playButton.node.active = this.playing;
        this.playing = !this.playing
        if (!this.playing) this.gameMng.pauseGame();
        else this.gameMng.continueGame();
        this.controlButtons.pauseButton.node.active = this.playing;
    },

    exitGame() {
        this.gameMng.exitGame();
        this.initManager(this.gameMng);
        this.hints.initUI(this);
        this.score.initUI(this);
        for (let button of this.controlButtons.mainMenuButtons()) {
            button.node.active = true;
        }
        for (let button of this.controlButtons.gameMenuButtons()) {
            button.node.active = false;
        }
        this.score.node.active = false;
        this.hints.node.active = false;
        this.searchBoxNode.active = false;
        this.resultsBoxNode.active = false;
        
        //this.init();
        //this.gameMng.
    },
    exchange(){
        this.gameMng.exchangeMode()
        this.controlButtons.exchangeButton.node.rotation += 180
    },
    startDict() {
        for (let button of this.controlButtons.mainMenuButtons()) {
            button.node.active = false;
        }
        for (let button of this.controlButtons.gameMenuButtons()) {
            button.node.active = false;
        }
        for (let button of this.controlButtons.dictMenuButtons()) {
            button.node.active = true;
        }
        for (let button of this.controlButtons.descriptionButtons()) {
            button.node.active = false;
        }
        this.searchBoxNode.active = true;
        this.resultsBoxNode.active = true;
    },
    startDescription(){
        for (let button of this.controlButtons.mainMenuButtons()) {
            button.node.active = false;
        }
        for (let button of this.controlButtons.gameMenuButtons()) {
            button.node.active = false;
        }
        for (let button of this.controlButtons.dictMenuButtons()) {
            button.node.active = false;
        }
        for (let button of this.controlButtons.descriptionButtons()) {
            button.node.active = true;
        }
        this.descriptionBoxNode.active = true;
    },
    search() {
        let self = this;
        let searchString = self.searchBoxNode.getComponentInChildren(cc.Label).string;
        if (searchString === '') return;

        if (searchString === '[' || searchString === ']' || searchString === '"' || searchString === "'") return;
        let results = [];
        for (let key in this.gameMng.compoMng.HanZiCompMDic) {
            if (key.includes(searchString)) {
                results.push({
                    character: this.gameMng.compoMng.HanZiCompMDic[key],
                    //meaning: meaning.json[api.json[key]]
                })
            }      
        }
        self.results.setResult(results);
    },

    // score ui
    setScore(value) {
        this.score.setTarValue(value);
    },

    getScore() {
        return this.score.value;
    },

    //
    updateHints(hintsArray, result) {
        if (!result) result = 'X';
        this.hints.updateHints(hintsArray);
        this.hints.updateHintResult(result);
    },
    ClearHints() {
        this.hints.ClearHints();
    }

    // update (dt) {},
});



