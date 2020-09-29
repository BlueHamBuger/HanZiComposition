const default_lable = "加载中"
const dots_string = [
    '','.','..','...','....'
]
var schedual_id = 0
cc.Class({
    extends: cc.Component,
    properties: {
        lable:{
            default:null,
            type:cc.Label
        },
        dots:0,
    },
    initUI (uiMng) {
        this.uiMng = uiMng;
    },
    onEnable(){
        schedual_id = setInterval(function(){
            this.dots = (this.dots+1)%5
            this.lable.string = default_lable + dots_string[this.dots];
        }.bind(this),1000)
    },
    onDisable(){
        clearInterval(schedual_id)
    },
});