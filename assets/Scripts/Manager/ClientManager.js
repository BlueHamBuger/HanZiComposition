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
    extends: require("BaseManager"),

    ctor(){
        this.gameMng=null;
    },
    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },
    initManager(gameMng,IP,port){
        this.gameMng=gameMng;
        this.IP=IP;
        this.port=port;
        var self=this;

        // 获得 初始化使用的汉字
        function getInitList(){
            if (xhr.readyState == XMLHttpRequest.DONE && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                var jsResult=JSON.parse(response);
                self.gameMng.compoMng.initList=jsResult;
            }
        }
        // 得到 汉字组合的 字典
        function getDic(){
            if (xhr.readyState == XMLHttpRequest.DONE && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                var jsResult=JSON.parse(response);
                self.gameMng.compoMng.HanZiCompDic=jsResult;
                // var url="http://"+this.IP+":"+this.port+"/init";
                // xhr.onreadystatechange = getInitList;
                // xhr.open("GET",url,false);
                // xhr.send();
            }
        }

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = getDic;
        var url="http://"+this.IP+":"+this.port+"/all";
        xhr.open("GET",url,false);
        xhr.send();


    },





    // update (dt) {},
});
