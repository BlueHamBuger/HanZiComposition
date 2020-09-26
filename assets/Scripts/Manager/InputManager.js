// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var Help = require("Help");
var StringProcess = require("StringProcess");

cc.Class({
    extends: require("BaseManager"),

    ctor() {
        this.touchController = {
            lastTouchCk: null,
            touchTimes: 0,
            isSame: false,
            isExped: false,
            reset: function() {
                this.lastTouchCk = null;
                this.touchTimes = 0;
                this.isSame = false;
                this.isExped = false;
            },
        }
    },
    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    initManager(gameMng, drawing) {
        //初始化参数
        this.gameMng = gameMng;
        this.drawing = drawing.getComponent('Drawing');
        this.drawing.inputMng = this;


        // 保存汉字序列
        this.hanZiSequence = "";
        this.hanZiContainer = HanZiContainer.createNew(this);

        //输入状态
        this.inputable = false;
        this.exchange_mode = false; // 置换状态 

        //保存上一次触摸的checker；
        this.node.on(cc.Node.EventType.TOUCH_START, this.OnTouchStart.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.OnBoardTouch.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.OnTouchEnd.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.OnTouchCancel.bind(this));

        // 全局事件注册
        this.gameMng.node.once('fallOver', function(){ this.inputable = true }, this);
    },
    update(dt) {
        if (this.touchController.lastTouchCk != null && this.touchController.isSame) {
            this.touchController.touchTimes += dt; // 如果持续触碰一个
            this.touchController.lastTouchCk.Opacity =this.touchController.lastTouchCk.Opacity+15>255?255:this.touchController.lastTouchCk.Opacity+15;
            if (this.hanZiContainer.getLength() == 1&&this.touchController.lastTouchCk.node.scale < 2.5) // 将字 放大
                this.touchController.lastTouchCk.node.scale += dt * 0.5;
            if (this.hanZiContainer.getLength() == 1 && this.touchController.touchTimes >= 1.2) {
                this.touchController.isExped = true;
                this.gameMng.checkerMng.ExplosionManager.StartExplode(this.touchController.lastTouchCk.boardPos);
                this.OnTouchCancel();
            }
        }
    },
    OnTouchStart(event) {
        if (!this.inputable) return;
        var posX = event.getLocationX();
        var posY = event.getLocationY();
        if (!this.gameMng.checkerMng.boundingBox.contains(cc.v2(posX, posY))) {
            this.OnTouchCancel();
        }
        var checker = this.gameMng.checkerMng.GetChecker(cc.v2(posX, posY));
        if (checker) {
            this.AddToContainer(checker.boardPos, checker.HanZi);
            this.touchController.lastTouchCk = checker;
            this.touchController.lastTouchCk.isSame = true;
        }
    },
    //erased 表示是否就行了擦除操作
    OnBoardTouch(event) {
        if (!this.inputable) return;
        var erasedPos = this.drawing.OnTouchMove(event);
        var posX = event.getLocationX();
        var posY = event.getLocationY();
        if (!this.gameMng.checkerMng.boundingBox.contains(cc.v2(posX, posY))) {
            this.OnTouchCancel();
        }
        var checker = (erasedPos != null) ? this.gameMng.checkerMng.GetChecker(erasedPos) :
            this.gameMng.checkerMng.GetChecker(cc.v2(posX, posY));
        if (checker) {
            //checker.Opacity = checker.Opacity+10;   
            if (erasedPos != null) {
                this.EraseToPos(checker.boardPos);
            } else {
                this.AddToContainer(checker.boardPos, checker.HanZi);
            }
            if (this.touchController.lastTouchCk == checker) {
                this.touchController.isSame = true;
            } else {
                this.touchController.reset();
            }
            this.touchController.lastTouchCk = checker;
        }
    },
    OnTouchEnd(event) {
        if (!this.inputable) return;
        //var queryString = JSON.stringify(this.hanZiContainer.structMatrix);
        this.drawing.ResetDrawing();
        if(!this.exchange_mode){ // 正常模式
            if (!this.touchController.isExped)
                this.gameMng.checkerMng.CompoRoute(this.ForgeCompRoute());
        }else{ // 交换模式
            if(this.hanZiContainer.getLength()==2){ // 只有为两个的情况才交换
                this.gameMng.checkerMng.swap(this.hanZiContainer.inPos[0],this.hanZiContainer.inPos[1])
            }
        }
        //this.gameMng.compoMng.LinearRegexQuery(this.hanZiContainer.structMatrix,this.hanZiContainer.initPos)
        this.hanZiContainer.Clear();
        this.gameMng.uiMng.ClearHints();
        this.touchController.reset();
        this.gameMng.checkerMng.resetCheckerState();
    },
    OnTouchCancel(event) {
        if (!this.inputable) return;
        this.drawing.ResetDrawing();
        this.hanZiContainer.Clear();
        this.gameMng.uiMng.ClearHints();
        this.touchController.reset();
        this.gameMng.checkerMng.resetCheckerState();
    },
    AddToContainer(pos, hanZi) {
        if (this.hanZiContainer.IsEmpty()) {
            this.hanZiContainer.AddToContainer(pos, hanZi);
            this.updateHints(null);
        } else if (this.hanZiContainer.IsPosIn(pos) == null) {
            var dir = pos.sub(this.hanZiContainer.curPos);
            if (dir.x != 0 && dir.y != 0)
                return; // TODO 拒绝连接 提示
            // 位置 跨越
            if (Math.abs(dir.x) >= 2 || Math.abs(dir.y) >= 2)
                return;
            this.hanZiContainer.AddToContainer(pos, hanZi);
            var result = this.QueryStruct();
            this.hanZiContainer.UpdateContainer(result);
            this.updateHints(result);
        } else {
            return;
        }
        this.gameMng.checkerMng.setCheckerState(pos, CheckerState.Selected);
    },
    EraseToPos(pos) {
        this.gameMng.checkerMng.resetCheckerState();
        this.hanZiContainer.eraseToPos(pos);
    },
    GetHanZi(pos) {
        return this.gameMng.checkerMng.GetHanZi(pos);
    },
    QueryStruct() {
        if (this.hanZiContainer.inPos.length > 1)
            return this.gameMng.compoMng.LinearQueueQuery(this.hanZiContainer.queryMatrix)[0];
        else
            return null;
    },
    updateHints(result) {
        //this.gameMng.uiMng.updateHints(this.hanZiContainer.structMatrix,result);
        this.gameMng.uiMng.updateHints(this.hanZiContainer.queryMatrix, result);
    },
    ForgeCompRoute() {
        return this.hanZiContainer.forgeCompRoute();
    },
    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START);
        this.node.off(cc.Node.EventType.TOUCH_MOVE);
        this.node.off(cc.Node.EventType.TOUCH_END);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL);
    },

});


var HanZiContainer = {
    createNew(inputMng) {
        var hanZiContainer = {};
        var self = hanZiContainer;

        self.inputMng = inputMng;
        // 保存的 结构是 struct
        self.structMatrix = [];
        self.queryMatrix = [];
        // initPos 表示 整个 矩形的左上角
        self.initPos = null;
        self.initQueryPos = null;
        self.curPos = null;
        // 存储当前 Cotainer中 包含的位置
        self.inPos = [];
        // 存储当前路线中 全部的可以组合的汉字的 
        //key 为 x_y 值为 可以组合成的汉字
        self.compoHanZis = {};
        // 表示这条路径最终可以 构成的汉字
        self.finalHanZi = null;
        Object.defineProperty(self, "length", {
            get: function() { return self.inPos.length; }
        });

        self.IsPosIn = function(pos) {
            for (let i = 0; i < self.inPos.length; i++) {
                if (self.inPos[i].equals(pos)) {
                    return i;
                }
            }
            return null;
        };
        self.IsEmpty = function() {
            return self.length == 0;
        };
        self.Clear = function() {
            self.inPos.length = 0;
            self.curPos = null;
            self.structMatrix.length = 0;
            self.initPos = null;
            self.compoHanZis = {};
            self.queryMatrix.length = 0;
            self.initQueryPos = null;
        };
        //将 汉字 根据 pos 来添加到
        self.AddToContainer = function(pos, hanZi) {
            if (self.initPos == null) {
                self.initPos = new cc.Vec2(pos.x, pos.y);
                self.initQueryPos = new cc.Vec2(pos.x, pos.y);
                self.curPos = new cc.Vec2(pos.x, pos.y);
            }
            self.curPos = pos;
            self.inPos.push(pos);
            var insertIndex = pos.sub(self.initPos);
            var insertQueryIndex = pos.sub(self.initQueryPos);
            if (insertIndex.x < 0) {
                self.structMatrix.unshift([]);
                insertIndex.x = 0;
                //self.initPos=pos;
                self.initPos.x--;
            } else if (self.structMatrix[insertIndex.x] == null) {
                self.structMatrix[insertIndex.x] = [];
            }
            if (insertIndex.y < 0) {
                for (var i in self.structMatrix) {
                    self.structMatrix[i].unshift(null);
                }
                insertIndex.y = 0;
                self.initPos.y--;
            }

            if (insertQueryIndex.x < 0) {
                self.queryMatrix.unshift([]);
                insertQueryIndex.x = 0;
                //self.initPos=pos;
                self.initQueryPos.x--;
            } else if (self.queryMatrix[insertQueryIndex.x] == null) {
                self.queryMatrix[insertQueryIndex.x] = [];
            }
            if (insertQueryIndex.y < 0) {
                for (var i in self.queryMatrix) {
                    self.queryMatrix[i].unshift(null);
                }
                insertQueryIndex.y = 0;
                self.initQueryPos.y--;
            }


            self.queryMatrix[insertQueryIndex.x][insertQueryIndex.y] = hanZi;
            self.structMatrix[insertIndex.x][insertIndex.y] = hanZi;

        };

        self.UpdateContainer = function(newHanZi) {
            self.finalHanZi = newHanZi;
            if (newHanZi) {
                var pos = self.inPos[self.inPos.length - 1];
                self.initPos = new cc.Vec2(pos.x, pos.y);
                self.curPos = new cc.Vec2(pos.x, pos.y);
                self.compoHanZis[pos.x + "_" + pos.y] = newHanZi;
                self.structMatrix = [
                    [newHanZi]
                ];
            }
        };
        self.eraseToPos = function(pos) {
            var index = self.IsPosIn(pos);
            if (index != null) {
                var poses = []
                for (let i = 0; i < index + 1; i++)
                    poses[i] = self.inPos[i];
                self.inPos.length = 0;
                self._ResetContainer(poses);
            } else {
                return;
            }
        };
        self._ResetContainer = function(poses) {
            self.initPos = null;
            self.curPos = null;
            self.initQueryPos = null;
            self.structMatrix.length = 0;
            self.compoHanZis = {};
            self.queryMatrix.length = 0;
            for (let i = 0; i < poses.length; i++) {
                var HanZi = self.inputMng.GetHanZi(poses[i]);
                self.inputMng.AddToContainer(poses[i], HanZi);
            }
        };
        self.forgeCompRoute = function() {
            // route 即为 途径的点构成的路径
            // posHanZi 即为 可以组合的关键点
            // 
            if (self.finalHanZi != null)
                return { points: self.inPos, posHanZi: self.compoHanZis };
            else
                return null;
        };
        self.getLength = function() {
            return self.inPos.length;
        };
        return self;
    }
}