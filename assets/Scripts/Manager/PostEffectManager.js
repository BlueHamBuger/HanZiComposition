// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


var LayerMask ={
    Defualt: -31,
    Blur : -30,
    OutLine :-28,
    PaintFliter:-24,
}


cc.Class({
    extends: require('BaseManager'),

    properties: {
        postNodes:{
            default:[],
            type:[cc.Node],
        },
    },
    initManager(gameMng,renderCamera){
        this.gameMng = gameMng;
        this.camera = renderCamera;
        this.shaderComps=[];
        this.renderTextures=[];
        for(var i =0;i<this.postNodes.length;i++){
            this.postNodes[i].width = cc.winSize.width;    
            this.postNodes[i].height = cc.winSize.height;
            this.shaderComps[i] = this.postNodes[i].getComponent('ShaderComponent');
            this.renderTextures[i] = new cc.RenderTexture;
            this.renderTextures[i].initWithSize(cc.winSize.width,cc.winSize.height);
        }
    },
    update(dt){
        this.camera.postRender(null,[LayerMask.Defualt,LayerMask.Blur,LayerMask.OutLine],
                                this.renderTextures,
                                this.shaderComps);
    }

});
