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
        searchResults: {
            default: [],
            type: Array
        },
        root: {
            default: null,
            type: cc.Node
        }
    },

    setResult(results) {
        this.searchResults = results;
        this.root.removeAllChildren();
        let x = -100, y = -40;
        for (let item of this.searchResults) {
            let child = new cc.Node('char_' + x + '_' + y);
            this.root.addChild(child);
            child.setPosition(x, y);
            child.color = new cc.Color(0, 0, 0, 255);
            let button = child.addComponent(cc.Button);
            button.node.removeAllChildren();
            let label = child.addComponent(cc.Label);
            let handler = new cc.Component.EventHandler();
            handler.target = child;
            handler.handler = "clickCallback";
            button.clickEvents.push(handler);
            label.string = item.character;
            x += 40;
            if (x > 120) {
                x = -100;
                y -= 40;
            }
            this.root.height = 20 - y
        }
    },

    clickCallback() {
        console.log("2333333");
    },


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    // update (dt) {},
});
