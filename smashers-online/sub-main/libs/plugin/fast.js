
(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class HomeScene extends k7.AppScene {
                constructor() {
                    super('home', 'fast');
                }
                bindChild() {
                    this.startButton = this.getButton('start');
                    this.signButton = this.getButton('sign');
                    this.lotteryButton = this.getButton('lottery');
                    this.ecoBar = this.getFairy('eco', fast.EcoBar);
                    this._eventList = [
                        fast.MsgKey.COIN_CHANGED,
                        fast.MsgKey.DIAMOND_CHANGED,
                        fast.MsgKey.ENERGY_CHANGED
                    ];
                }
                onEvent(n, p) {
                    this.ecoBar.onEvent(n, p);
                }
                refreshUi() {
                    this.ecoBar.refreshUi();
                }
                onClickButton(button) {
                    switch (button) {
                        case this.startButton:
                            mvc.send(fast.MsgKey.START_GAME);
                            return;
                        case this.signButton:
                            fast.showSignWindow();
                            return;
                        case this.lotteryButton:
                            fast.showLotteryWindow();
                            return;
                    }
                }
                hide() {
                    super.hide();
                    this.ecoBar.clear();
                }
            }
            fast.HomeScene = HomeScene;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            var MsgKey;
            (function (MsgKey) {
                /** 当主界面点击游戏开始 */
                MsgKey.START_GAME = 'START_GAME';
                /** 打开签到界面 */
                MsgKey.SHOW_SGIN = 'SHOW_SGIN';
                /** 签到成功 */
                MsgKey.ON_SIGNED = 'ON_SIGNED';
                /** 签到双倍 */
                MsgKey.ON_SIGNED_DOUBLE = 'ON_SIGNED_DOUBLE';
                /** 打开抽奖界面 */
                MsgKey.SHOW_LOTTERY = 'SHOW_LOTTERY';
                /** 抽了一次奖 */
                MsgKey.ON_SPUN = 'ON_SPUN';
                /** 金币余额发生改变 */
                MsgKey.COIN_CHANGED = 'COIN_CHANGED';
                /** 砖石余额发生改变 */
                MsgKey.DIAMOND_CHANGED = 'DIAMOND_CHANGED';
                /** 体力余额发生改变 */
                MsgKey.ENERGY_CHANGED = 'ENERGY_CHANGED';
                /** 体力已达上限 */
                MsgKey.ENERGY_LIMIT = 'ENERGY_LIMIT';
                /** 金币已亏空，破产了 */
                MsgKey.COIN_ZERO = 'COIN_ZERO';
                /** 钻石已亏空，破产了 */
                MsgKey.DIAMOND_ZERO = 'DIAMOND_ZERO';
                /** 体力已亏空，破产了 */
                MsgKey.ENERGY_ZERO = 'ENERGY_ZERO';
                /** 金币不足，需要补充 */
                MsgKey.COIN_NOT_ENOUGH = 'COIN_NOT_ENOUGH';
                /** 钻石不足，需要补充 */
                MsgKey.DIAMOND_NOT_ENOUGH = 'DIAMOND_NOT_ENOUGH';
                /** 体力不足，需要补充 */
                MsgKey.ENERGY_NOT_ENOUGH = 'ENERGY_NOT_ENOUGH';
                //========= 触发后续行为
                /** 结算界面触发游戏重新开始 */
                MsgKey.ON_GAME_RESTART = 'ON_GAME_RESTART';
                /** 结算界面触发游戏复活 */
                MsgKey.ON_GAME_REVIVE = 'ON_GAME_REVIVE';
                /** 结算界面触发游戏继续，可能是直接下一关，或去关卡界面，由业务决定 */
                MsgKey.ON_GAME_NEXT = 'ON_GAME_NEXT';
                //=========
            })(MsgKey = fast.MsgKey || (fast.MsgKey = {}));
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class EcoBar extends k7.FairyMediator {
                bindChild() {
                    this.coinButton = this.getButton('coin');
                    this.diamondButton = this.getButton('diamond');
                    this.energyButton = this.getButton('energy');
                    this.ecoButtons = [];
                    this.ecoButtonsX = [this.coinButton.x, this.diamondButton.x, this.energyButton.x];
                    if (this.coinButton.visible = FastConst.initialGold.v != -1) {
                        this.ecoButtons.push(this.coinButton);
                        this.coinButton.x = this.ecoButtonsX[this.ecoButtons.length - 1];
                    }
                    if (this.diamondButton.visible = FastConst.initialDiamond.v != -1) {
                        this.ecoButtons.push(this.diamondButton);
                        this.diamondButton.x = this.ecoButtonsX[this.ecoButtons.length - 1];
                    }
                    if (this.energyButton.visible = FastConst.initialEnergy.v != -1) {
                        this.ecoButtons.push(this.energyButton);
                        this.energyButton.x = this.ecoButtonsX[this.ecoButtons.length - 1];
                    }
                }
                onEvent(n, p) {
                    switch (n) {
                        case fast.MsgKey.COIN_CHANGED:
                            this.coinButton.title = numFormat(fast.ecoProxy.getCoin());
                            break;
                        case fast.MsgKey.DIAMOND_CHANGED:
                            this.diamondButton.title = numFormat(fast.ecoProxy.getDiamond());
                            break;
                        case fast.MsgKey.ENERGY_CHANGED:
                            this.energyButton.title = numFormat(fast.ecoProxy.getEnergy());
                            this.checkAutoRecoverEnergy();
                            break;
                    }
                }
                checkAutoRecoverEnergy() {
                    if (FastConst.recoverEnergy.v > 0 && fast.ecoProxy.getEnergy() < FastConst.maxEnergy.v) {
                        this.energyButton.getController('c2').selectedIndex = 1;
                        Laya.timer.frameLoop(1, this, this.refreshEnergyAutoTime);
                    }
                    else {
                        this.energyButton.getController('c2').selectedIndex = 0;
                        this.clear();
                    }
                }
                refreshEnergyAutoTime() {
                    this.energyButton.getChild('cd').asTextField.text = timeFormat(fast.nrgProxy.getTimeLeft());
                }
                refreshUi() {
                    this.coinButton.title = numFormat(fast.ecoProxy.getCoin());
                    this.diamondButton.title = numFormat(fast.ecoProxy.getDiamond());
                    this.energyButton.title = numFormat(fast.ecoProxy.getEnergy());
                    this.checkAutoRecoverEnergy();
                }
                clear() {
                    Laya.timer.clear(this, this.refreshEnergyAutoTime);
                }
            }
            fast.EcoBar = EcoBar;
            /** 补足2位 */
            function m2(s) {
                return ((s + '').length == 1 ? '0' : '') + s;
            }
            /**
             * 时间格式化
             * @param s 秒
             * @param format 显示格式
             * h表示小时
             * m表示分钟
             * s表示秒
             * 双写表示补足两位
             * 三写表示忽略上一级
             * 比如1小时零1分(3660)，mmm会显示61，而mm会显示01，m则显示1
             */
            function timeFormat(sss, format = 'mm:ss') {
                let hhh = Math.floor(sss / 3600);
                let mmm = Math.floor(sss / 60);
                if (format.indexOf('hhh') != -1)
                    format = format.replace('hhh', hhh + '');
                else if (format.indexOf('hh') != -1)
                    format = format.replace('hh', m2(Math.floor(hhh % 24)));
                else if (format.indexOf('h') != -1)
                    format = format.replace('h', Math.floor(hhh % 24) + '');
                if (format.indexOf('mmm') != -1)
                    format = format.replace('mmm', mmm + '');
                else if (format.indexOf('mm') != -1)
                    format = format.replace('mm', m2(Math.floor(mmm % 60)));
                else if (format.indexOf('m') != -1)
                    format = format.replace('m', Math.floor(mmm % 60) + '');
                if (format.indexOf('sss') != -1)
                    format = format.replace('sss', sss + '');
                else if (format.indexOf('ss') != -1)
                    format = format.replace('ss', m2(Math.floor(sss % 60)));
                else if (format.indexOf('s') != -1)
                    format = format.replace('s', Math.floor(sss % 60) + '');
                return format;
            }
            function numFormat(n) {
                if (fast.getOption().ecoAbbreviate)
                    return n + '';
                let w = ['', 'K', 'M', "B", 'T', 'Q'];
                let s = n + '';
                let b = Math.floor((s.length - 1) / 3);
                if (b >= w.length)
                    b = w.length - 1;
                n = n / Math.pow(10, b * 3);
                if (n > 999)
                    n = Math.floor(n);
                else if (n > 99)
                    n = Math.floor(n * 10) / 10;
                else if (n > 9)
                    n = Math.floor(n * 100) / 100;
                else
                    n = Math.floor(n * 1000) / 1000;
                return n + (w[b]);
            }
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class RewardWindow extends k7.AppWindow {
                bindChild() {
                    this.homeButton = this.getButton('home');
                    this.rewardButton = this.getButton('reward');
                    this.nextButton = this.getButton('next');
                    this.nextWdButton = this.getButton('next_wd');
                    this.opCtrl = this.getController('c1');
                    this.platCtrl = this.getController('c2');
                }
                onClickButton(button) {
                    switch (button) {
                        case this.rewardButton:
                            this.onClickRewardButton();
                            return;
                        case this.nextButton:
                        case this.nextWdButton:
                            this.onClickNextButton();
                            return;
                        case this.homeButton:
                            this.hide();
                            k7.AppScene.show(fast.HomeScene);
                            return;
                    }
                }
                /**
                 * 价值点奖励，胜利失败则为多倍奖励，
                 * 复活折为广告复活，
                 * 具体奖励内容可根据业务自定义
                 */
                onClickRewardButton() {
                    //暂时只能看广告，没有接入价值点，待价值点系统重构后，接入
                    let videoInst = k7.xsdk.agentManager.getAdsPlugin().showRewardedVideoAd({
                        success: res => {
                            k7.xsdk.agentManager.getAnalyticsGroup().onVideoWatch({
                                video_scene_id: this.id,
                                video_show_success: true
                            });
                        },
                        fail: (err, msg) => {
                            k7.xsdk.agentManager.getAnalyticsGroup().onVideoWatch({
                                video_scene_id: this.id,
                                video_show_success: false,
                                video_fail_code: err
                            });
                        },
                        close: res => {
                            k7.xsdk.agentManager.getAnalyticsGroup().onVideoComplete({
                                video_scene_id: this.id,
                                video_watch_success: res.isFinished
                            });
                            res.isFinished ? this.onRewardSuccess() : this.onRewardFailed();
                        }
                    });
                }
                onRewardSuccess() {
                    this.hide();
                    this.onReward();
                }
                // 领奖失败处理
                onRewardFailed() {
                }
                onClickNextButton() {
                    this.hide();
                    this.onNext();
                }
            }
            fast.RewardWindow = RewardWindow;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));



(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class EcoRewardWindow extends fast.RewardWindow {
                constructor() {
                    super('reward', 'fast');
                }
                bindChild() {
                    super.bindChild();
                    this.coinComp = this.getLabel('coin');
                    this.infoLdr = this.getLoader('info');
                    this.navList = this.getList('navList');
                    this.navLeft = this.getButton('navLeft');
                    this.navRight = this.getButton('navRight');
                    this.rstCtrl = this.getController('c3');
                    this.rwCtrl = this.getController('c4');
                    this.platCtrl.selectedPage = "oppo";
                }
                playLdrAni(name) {
                    if (this.infoLdr.component) {
                        let ani = this.infoLdr.component.getTransition(name);
                        ani && ani.play();
                    }
                }
                getLdrCtrl(name) {
                    if (this.infoLdr.component) {
                        return this.infoLdr.component.getController(name);
                    }
                }
                getLdrTextFiled(name) {
                    if (this.infoLdr.component) {
                        let obj = this.infoLdr.component.getChild(name);
                        return obj ? obj.asTextField : null;
                    }
                }
                doShowAnimation() {
                    super.doShowAnimation();
                    this.playLdrAni(this.transShowName);
                }
                doHideAnimation() {
                    super.doHideAnimation();
                    this.playLdrAni(this.transHideName);
                }
                onRewardSuccess() {
                    this.rwCtrl.selectedIndex = 0;
                    this.onReward();
                }
                refreshEcoUi(type, val) {
                    this.coinComp.getController('c1').selectedIndex = type;
                    this.coinComp.title = 'x' + val;
                    if (this.infoLdr.component) {
                        let ctrl = this.infoLdr.component.getController('c1');
                        ctrl && (ctrl.selectedIndex = type);
                        let tf = this.getLdrTextFiled('title');
                        tf && (tf.text = 'x' + val);
                    }
                }
            }
            fast.EcoRewardWindow = EcoRewardWindow;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class EventPretreat {
                execute(eventName, params) {
                    switch (eventName) {
                        case fast.MsgKey.COIN_NOT_ENOUGH:
                            fast.showNotEnoughWindow({ type: 1, val: params });
                            return;
                        case fast.MsgKey.DIAMOND_NOT_ENOUGH:
                            fast.showNotEnoughWindow({ type: 2, val: params });
                            return;
                        case fast.MsgKey.ENERGY_NOT_ENOUGH:
                            fast.showNotEnoughWindow({ type: 3, val: params });
                            return;
                    }
                }
            }
            fast.EventPretreat = EventPretreat;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));



(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class GainWindow extends fast.EcoRewardWindow {
                bindChild() {
                    super.bindChild();
                    this.rstCtrl.selectedIndex = 3;
                    this.rwCtrl.selectedIndex = 1;
                }
                refreshUi() {
                    this.openData && this.refreshEcoUi(this.openData.type, this.openData.val);
                }
                // 胜利界面，继续下一步
                onNext() {
                    //close           
                }
                //双倍领奖
                onReward() {
                    this.openData && fast.rewardProxy.add(this.openData.type, this.openData.val);
                }
            }
            fast.GainWindow = GainWindow;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            var _option;
            /** 获取配置 */
            function getOption() {
                return _option;
            }
            fast.getOption = getOption;
            /**
             * 初始化快速模板
             * @param op 初始化参数
             */
            function init(op) {
                if (op.hasSign === undefined)
                    op.hasSign = true;
                if (op.hasLottery === undefined)
                    op.hasLottery = true;
                _option = op;
                fast.ecoProxy.load();
                if (op.hasEnergy)
                    fast.nrgProxy.load();
                if (op.hasSign)
                    fast.signProxy.load();
                if (op.hasLottery)
                    fast.lotteryProxy.load();
                mvc.registerCommand(fast.MsgKey.COIN_NOT_ENOUGH, fast.EventPretreat);
                mvc.registerCommand(fast.MsgKey.DIAMOND_NOT_ENOUGH, fast.EventPretreat);
                mvc.registerCommand(fast.MsgKey.ENERGY_NOT_ENOUGH, fast.EventPretreat);
            }
            fast.init = init;
            /** 获取主界面的实例 */
            function getHomeScene() {
                return k7.getFairyInstence(_option.homeScene || fast.HomeScene);
            }
            fast.getHomeScene = getHomeScene;
            /** 展示主界面 */
            function showHomeScene() {
                return k7.AppScene.show(_option.homeScene || fast.HomeScene);
            }
            fast.showHomeScene = showHomeScene;
            /** 获取游戏界面的实例 */
            function getGameScene() {
                return k7.getFairyInstence(_option.gameScene || fast.EmptyGameScene);
            }
            fast.getGameScene = getGameScene;
            /** 展示游戏界面 */
            function showGameScene() {
                return k7.AppScene.show(_option.gameScene || fast.EmptyGameScene);
            }
            fast.showGameScene = showGameScene;
            /** 获取胜利界面的实例 */
            function getGameSuccessWindow() {
                return k7.getFairyInstence(_option.successWindow || fast.GameSuccessWindow);
            }
            fast.getGameSuccessWindow = getGameSuccessWindow;
            /** 展示胜利界面，并发奖 */
            function showGameSuccessWindow(op) {
                if (!op)
                    op = { type: fast.RewardType.COIN, val: FastConst.winGold.v };
                if (op.val > 0)
                    fast.rewardProxy.add(op.type, op.val);
                return k7.AppWindow.showByParam(_option.successWindow || fast.GameSuccessWindow, op);
            }
            fast.showGameSuccessWindow = showGameSuccessWindow;
            /** 获取失败界面的实例 */
            function getGameFailWindow() {
                return k7.getFairyInstence(_option.failWindow || fast.GameFailWindow);
            }
            fast.getGameFailWindow = getGameFailWindow;
            /** 展示失败界面，并发奖 */
            function showGameFailWindow(op) {
                if (!op)
                    op = { type: fast.RewardType.COIN, val: FastConst.lostGold.v };
                if (op.val > 0)
                    fast.rewardProxy.add(op.type, op.val);
                return k7.AppWindow.showByParam(_option.failWindow || fast.GameFailWindow, op);
            }
            fast.showGameFailWindow = showGameFailWindow;
            /** 获取复活界面的实例 */
            function getGameReviveWindow() {
                return k7.getFairyInstence(_option.reviveWindow || fast.GameReviveWindow);
            }
            fast.getGameReviveWindow = getGameReviveWindow;
            /** 展示复活界面 */
            function showGameReviveWindow() {
                return k7.AppWindow.showByParam(_option.reviveWindow || fast.GameReviveWindow);
            }
            fast.showGameReviveWindow = showGameReviveWindow;
            /** 获取签到界面的实例 */
            function getSignWindow() {
                return k7.getFairyInstence(_option.signWindow || fast.SignWindow);
            }
            fast.getSignWindow = getSignWindow;
            /** 展示签到界面 */
            function showSignWindow() {
                return k7.AppWindow.showByParam(_option.signWindow || fast.SignWindow);
            }
            fast.showSignWindow = showSignWindow;
            /** 获取抽奖界面的实例 */
            function getLotteryWindow() {
                return k7.getFairyInstence(_option.lotteryWindow || fast.LotteryWindow);
            }
            fast.getLotteryWindow = getLotteryWindow;
            /** 展示抽奖界面 */
            function showLotteryWindow() {
                return k7.AppWindow.showByParam(_option.lotteryWindow || fast.LotteryWindow);
            }
            fast.showLotteryWindow = showLotteryWindow;
            /** 获取恭喜获得界面的实例 */
            function getGainWindow() {
                return k7.getFairyInstence(_option.gainWindow || fast.GainWindow);
            }
            fast.getGainWindow = getGainWindow;
            /** 展示恭喜获得界面 */
            function showGainWindow(op) {
                return k7.AppWindow.showByParam(_option.gainWindow || fast.GainWindow, op);
            }
            fast.showGainWindow = showGainWindow;
            /** 获取资源不足界面的实例 */
            function getNotEnoughWindow() {
                return k7.getFairyInstence(_option.notEnoughWindow || fast.NotEnoughWindow);
            }
            fast.getNotEnoughWindow = getNotEnoughWindow;
            /** 展示资源不足界面 */
            function showNotEnoughWindow(op) {
                return k7.AppWindow.showByParam(_option.notEnoughWindow || fast.NotEnoughWindow, op);
            }
            fast.showNotEnoughWindow = showNotEnoughWindow;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));



(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class NotEnoughWindow extends fast.EcoRewardWindow {
                bindChild() {
                    super.bindChild();
                    this.rstCtrl.selectedIndex = 4;
                    this.rwCtrl.selectedIndex = 1;
                    this.typeCtrl = this.infoLdr.component.getController('c1');
                }
                refreshUi() {
                    if (this.openData) {
                        switch (this.openData.type) {
                            case fast.RewardType.COIN:
                                this.refreshEcoUi(this.openData.type, FastConst.adGold.v);
                                return;
                            case fast.RewardType.DIAMOND:
                                this.refreshEcoUi(this.openData.type, FastConst.adDiamond.v);
                                return;
                            case fast.RewardType.ENERGY:
                                this.refreshEcoUi(this.openData.type, FastConst.adEnergy.v);
                                return;
                        }
                    }
                }
                // 胜利界面，继续下一步
                onNext() {
                    //close           
                }
                //双倍领奖
                onReward() {
                    if (this.openData) {
                        switch (this.openData.type) {
                            case fast.RewardType.COIN:
                                fast.rewardProxy.add(this.openData.type, FastConst.adGold.v);
                                return;
                            case fast.RewardType.DIAMOND:
                                fast.rewardProxy.add(this.openData.type, FastConst.adDiamond.v);
                                return;
                            case fast.RewardType.ENERGY:
                                fast.rewardProxy.add(this.openData.type, FastConst.adEnergy.v);
                                return;
                        }
                    }
                }
            }
            fast.NotEnoughWindow = NotEnoughWindow;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class EmptyGameScene extends k7.AppScene {
                constructor() {
                    super('game', 'fast');
                }
                bindChild() {
                    this.winButton = this.getButton('win');
                    this.reviveButton = this.getButton('revive');
                    this.loseButton = this.getButton('lose');
                }
                onClickButton(button) {
                    switch (button) {
                        case this.winButton:
                            fast.showGameSuccessWindow();
                            return;
                        case this.reviveButton:
                            fast.showGameReviveWindow();
                            return;
                        case this.loseButton:
                            fast.showGameFailWindow();
                            return;
                    }
                }
            }
            fast.EmptyGameScene = EmptyGameScene;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class GameOverWindow extends fast.EcoRewardWindow {
                onNext() {
                    // 胜利界面，继续下一步
                }
                //广告N倍领奖
                onReward() {
                    if (this.openData && this.openData.val > 0) {
                        fast.rewardProxy.add(this.openData.type, this.openData.val * (FastConst.rewardTimes.v - 1));
                    }
                }
            }
            fast.GameOverWindow = GameOverWindow;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));





(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class GameFailWindow extends fast.GameOverWindow {
                bindChild() {
                    super.bindChild();
                    this.rstCtrl.selectedIndex = 1;
                }
                refreshUi() {
                    this.rwCtrl.selectedIndex = 1;
                    this.refreshEcoUi(fast.RewardType.COIN, FastConst.lostGold.v);
                }
                // 失败界面下一步重新开始
                onNext() {
                    mvc.send(fast.MsgKey.ON_GAME_RESTART);
                }
            }
            fast.GameFailWindow = GameFailWindow;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class GameReviveWindow extends fast.EcoRewardWindow {
                bindChild() {
                    super.bindChild();
                    this.rstCtrl.selectedIndex = 2;
                    this.timesupTf = this.getLdrTextFiled('time');
                }
                refreshUi() {
                    this.rwCtrl.selectedIndex = 1;
                    this._time = FastConst.reviveTime.v;
                    if (this._time > 0) {
                        this.onTimeStep();
                        Laya.timer.loop(1000, this, this.onTimeStep);
                    }
                }
                onTimeStep() {
                    if (this._time >= 0) {
                        this.timesupTf.text = this._time + '';
                        this._time -= 1;
                    }
                    else {
                        this.hide();
                        this.onNext();
                    }
                }
                //复活界面，放弃复活游戏失败
                onNext() {
                    fast.showGameFailWindow();
                }
                //复活
                onReward() {
                    mvc.send(fast.MsgKey.ON_GAME_REVIVE);
                }
                hide() {
                    Laya.timer.clear(this, this.onTimeStep);
                    super.hide();
                }
            }
            fast.GameReviveWindow = GameReviveWindow;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class GameSuccessWindow extends fast.GameOverWindow {
                refreshUi() {
                    this.rwCtrl.selectedIndex = 1;
                    this.refreshEcoUi(this.openData.type, this.openData.val);
                }
                // 胜利界面，继续下一步
                onNext() {
                    mvc.send(fast.MsgKey.ON_GAME_NEXT);
                }
            }
            fast.GameSuccessWindow = GameSuccessWindow;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class LotteryWindow extends fast.RewardWindow {
                constructor() {
                    super('lottery', 'fast');
                    this.oneR = 60; //每一块的扇形角度
                }
                bindChild() {
                    super.bindChild();
                    this.isFullScreen = true;
                    this.ecoBar = this.getFairy('eco', fast.EcoBar);
                    this.typeCtrl = this.getController('c3');
                    this.labels = [];
                    for (let i = 0; i < 6; i += 1) {
                        this.labels[i] = this.getLabel('frame.pane.item' + i);
                    }
                    this.pane = this.getComp('frame.pane');
                    this._eventList = [
                        fast.MsgKey.COIN_CHANGED,
                        fast.MsgKey.DIAMOND_CHANGED,
                        fast.MsgKey.ENERGY_CHANGED
                    ];
                }
                onEvent(n, p) {
                    this.ecoBar.onEvent(n, p);
                }
                refreshUi() {
                    this.typeCtrl.selectedIndex = fast.lotteryProxy.isSpun() ? 1 : 0;
                    for (let i in FastLottery) {
                        this.labels[i].title = FastLottery[i].val + '';
                        this.labels[i].getController('c1').selectedIndex = FastLottery[i].type;
                    }
                    this.ecoBar.refreshUi();
                }
                spin() {
                    if (this.turnning)
                        return;
                    this.resIdx = fast.lotteryProxy.spin();
                    if (this.resIdx != -1) {
                        this.closeButton.visible = false;
                        this.turnning = true;
                        this.pane.rotation %= 360;
                        let r = 360 - this.oneR * this.resIdx;
                        k7.tween.to(this.pane, { rotation: 720 }, 1800, Laya.Ease.quadIn)
                            .to({ rotation: 1800 + r }, 2200, Laya.Ease.linearNone)
                            .to({ rotation: 2520 + r }, 2500, Laya.Ease.quadOut)
                            .call(this.playStopEffect, this);
                    }
                }
                playStopEffect() {
                    // effect todo.
                    Laya.timer.callLater(this, this.onTurnComplete);
                }
                onTurnComplete() {
                    this.turnning = false;
                    this.closeButton.visible = true;
                    let rw = FastLottery[this.resIdx];
                    fast.rewardProxy.add(rw.type, rw.val);
                    this.refreshUi();
                    k7.AppWindow.showByParam(fast.GainWindow, rw);
                }
                onClickNextButton() {
                    //覆盖父类，因为父类有hide
                    this.onNext();
                }
                /** 继续按钮，普通抽奖 */
                onNext() {
                    if (fast.lotteryProxy.isSpun())
                        return;
                    this.spin();
                }
                onClickRewardButton() {
                    if (this.turnning)
                        return;
                    super.onClickRewardButton();
                }
                onRewardSuccess() {
                    //覆盖父类，因为父类有hide
                    this.onReward();
                }
                /** 价值点抽奖，每日第二次以上抽奖入口 */
                onReward() {
                    this.spin();
                }
                hide() {
                    super.hide();
                    this.ecoBar.clear();
                }
            }
            fast.LotteryWindow = LotteryWindow;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            var ecoProxy;
            (function (ecoProxy) {
                const SAVE_KEY = 'fast.eco';
                var local;
                function save() {
                    Laya.LocalStorage.setItem(SAVE_KEY, JSON.stringify(local));
                }
                ecoProxy.save = save;
                function load() {
                    local = JSON.parse(Laya.LocalStorage.getItem(SAVE_KEY) || "{}");
                    if (!local.coin)
                        local.coin = FastConst.initialGold.v;
                    if (!local.diamond)
                        local.diamond = FastConst.initialDiamond.v;
                    if (!local.energy)
                        local.energy = FastConst.initialEnergy.v;
                }
                ecoProxy.load = load;
                /**
                 *  查金币余额
                 * @param value 要查询的数值(查余额够不够)
                 * @param tip 如果不够，是否直接派发余额不足事件，事件参数为需要的金币，默认为true
                 * @returns 返回是否足够
                 */
                function checkCoin(value, tip = true) {
                    if (local.coin >= value)
                        return true;
                    if (tip)
                        mvc.send(fast.MsgKey.COIN_NOT_ENOUGH, value);
                    return false;
                }
                ecoProxy.checkCoin = checkCoin;
                /** 增加金币，传入的是增量，修改数值，并发布事件 */
                function addCoin(value) {
                    setCoin(local.coin + value);
                    return local.coin;
                }
                ecoProxy.addCoin = addCoin;
                /** 设置金币的定量，直接修改数值，并发布事件。如果少于0，会派发破产事件，且值会定格在0，参数为倒欠数 */
                function setCoin(value) {
                    local.coin = value;
                    if (value < 0) {
                        local.coin = 0;
                        let more = local.coin + value;
                        mvc.send(fast.MsgKey.COIN_ZERO, more);
                    }
                    save();
                    mvc.send(fast.MsgKey.COIN_CHANGED);
                }
                ecoProxy.setCoin = setCoin;
                /** 获取当前金币数量 */
                function getCoin() {
                    return local.coin;
                }
                ecoProxy.getCoin = getCoin;
                /**
                 *  查砖石余额
                 * @param value 要查询的数值(查余额够不够)
                 * @param tip 如果不够，是否直接派发余额不足事件，事件参数为需要的钻石，默认为true
                 * @returns 返回是否足够
                 */
                function checkDiamond(value, tip = true) {
                    if (local.coin >= value)
                        return true;
                    if (tip)
                        mvc.send(fast.MsgKey.DIAMOND_NOT_ENOUGH, value);
                    return false;
                }
                ecoProxy.checkDiamond = checkDiamond;
                /** 增加钻石，传入的是增量，修改数值，并发布事件 */
                function addDiamond(value) {
                    setDiamond(local.diamond + value);
                    return local.diamond;
                }
                ecoProxy.addDiamond = addDiamond;
                /** 设置钻石的定量，直接修改数值，并发布事件。如果少于0，会派发破产事件，且值会定格在0，参数为倒欠数 */
                function setDiamond(value) {
                    local.diamond = value;
                    if (value < 0) {
                        local.coin = 0;
                        let more = local.coin + value;
                        mvc.send(fast.MsgKey.DIAMOND_ZERO, more);
                    }
                    save();
                    mvc.send(fast.MsgKey.DIAMOND_CHANGED);
                }
                ecoProxy.setDiamond = setDiamond;
                /** 获取当前钻石数量 */
                function getDiamond() {
                    return local.diamond;
                }
                ecoProxy.getDiamond = getDiamond;
                /**
                 *  查体力余额
                 * @param value 要查询的数值(查余额够不够)
                 * @param tip 如果不够，是否直接派发余额不足事件，事件参数为需要的体力，默认为true
                 * @returns 返回是否足够
                 */
                function checkEnergy(value, tip = true) {
                    if (local.coin >= value)
                        return true;
                    if (tip)
                        mvc.send(fast.MsgKey.ENERGY_NOT_ENOUGH, value);
                    return false;
                }
                ecoProxy.checkEnergy = checkEnergy;
                /** 增加体力，传入的是增量，修改数值，并发布事件 */
                function addEnergy(value) {
                    setEnergy(local.energy + value);
                    return local.energy;
                }
                ecoProxy.addEnergy = addEnergy;
                /**
                 * 设置体力的定量，直接修改数值，并发布事件。
                 * 如果少于0，会派发破产事件，且值会定格在0，参数为倒欠数，
                 * 如果大于上限，会派发超限事件，值定格为最高限，事件参数为溢出数。
                 */
                function setEnergy(value) {
                    local.energy = value;
                    if (value < 0) {
                        local.energy = 0;
                        let more = local.energy + value;
                        mvc.send(fast.MsgKey.ENERGY_ZERO, more);
                    }
                    else if (local.energy > FastConst.limitEnergy.v) {
                        let more = local.energy - FastConst.limitEnergy.v;
                        local.energy = FastConst.limitEnergy.v;
                        mvc.send(fast.MsgKey.ENERGY_LIMIT, more);
                    }
                    save();
                    mvc.send(fast.MsgKey.ENERGY_CHANGED);
                }
                ecoProxy.setEnergy = setEnergy;
                /** 获取当前体力值 */
                function getEnergy() {
                    return local.energy;
                }
                ecoProxy.getEnergy = getEnergy;
            })(ecoProxy = fast.ecoProxy || (fast.ecoProxy = {}));
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            var lotteryProxy;
            (function (lotteryProxy) {
                const SAVE_KEY = 'fast.lottery';
                var local;
                function save() {
                    Laya.LocalStorage.setItem(SAVE_KEY, JSON.stringify(local));
                }
                lotteryProxy.save = save;
                function load() {
                    local = JSON.parse(Laya.LocalStorage.getItem(SAVE_KEY) || "{}");
                    if (!local.time)
                        local.time = 0; //转盘的时间记录
                }
                lotteryProxy.load = load;
                /** 是否已经抽过奖了 */
                function isSpun() {
                    return local.time >= new Date().setHours(0, 0, 0, 0);
                }
                lotteryProxy.isSpun = isSpun;
                /** 调用签到界面 */
                function spin() {
                    let i = random();
                    local.time = Date.now();
                    k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                        custom_event_name: '抽奖'
                    });
                    save();
                    mvc.send(fast.MsgKey.ON_SPUN, i);
                    return i;
                }
                lotteryProxy.spin = spin;
                /** 根据抽奖的概率表，随机获得一个序号 */
                function random() {
                    let c = 0;
                    for (let item of FastLottery) {
                        c += item.weight;
                    }
                    let r = Math.floor(Math.random() * c);
                    let v = 0;
                    for (let i in FastLottery) {
                        v += FastLottery[i].weight;
                        if (r < v)
                            return +i;
                    }
                    return -1;
                }
                lotteryProxy.random = random;
            })(lotteryProxy = fast.lotteryProxy || (fast.lotteryProxy = {}));
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            var nrgProxy;
            (function (nrgProxy) {
                const SAVE_KEY = 'fast.nrg';
                var local;
                function save() {
                    Laya.LocalStorage.setItem(SAVE_KEY, JSON.stringify(local));
                }
                nrgProxy.save = save;
                function load() {
                    local = JSON.parse(Laya.LocalStorage.getItem(SAVE_KEY) || "{}");
                    if (FastConst.initialEnergy.v != -1) {
                        mvc.on(fast.MsgKey.ENERGY_CHANGED, null, checkAuto);
                        let now = Date.now();
                        if (!local.last) {
                            local.last = now;
                            let time = FastConst.recoverEnergy.v * 1000;
                            _nexttime = time + local.last;
                            Laya.timer.once(time, null, autoCecover, null, false);
                        }
                        else {
                            if (fast.ecoProxy.getEnergy() >= FastConst.maxEnergy.v)
                                return;
                            let offtime = now - local.last;
                            if (offtime > 0 && fast.ecoProxy.getEnergy() < FastConst.maxEnergy.v) {
                                _running = true;
                            }
                            let offNrg = Math.floor(offtime / (FastConst.recoverEnergy.v * 1000));
                            if (offNrg > 0) {
                                let autoNrg = Math.min(fast.ecoProxy.getEnergy() + offNrg, FastConst.maxEnergy.v);
                                local.last += (autoNrg - fast.ecoProxy.getEnergy()) * (FastConst.recoverEnergy.v * 1000);
                                fast.ecoProxy.setEnergy(autoNrg);
                            }
                            else {
                                checkAuto();
                            }
                        }
                    }
                }
                nrgProxy.load = load;
                var _running;
                var _nexttime;
                function getNextTime() {
                    return _nexttime;
                }
                nrgProxy.getNextTime = getNextTime;
                /** 剩余多少秒可刷新 */
                function getTimeLeft() {
                    return Math.floor((_nexttime - Date.now()) / 1000) + 1;
                }
                nrgProxy.getTimeLeft = getTimeLeft;
                function checkAuto() {
                    let now = Date.now();
                    if (fast.ecoProxy.getEnergy() < FastConst.maxEnergy.v) {
                        if (!_running)
                            local.last = now;
                        _running = true;
                        _nexttime = local.last + FastConst.recoverEnergy.v * 1000;
                        Laya.timer.once(_nexttime - now, null, autoCecover, null, false);
                    }
                    else {
                        _running = false;
                        Laya.timer.clear(null, autoCecover);
                    }
                }
                function autoCecover() {
                    if (fast.ecoProxy.getEnergy() < FastConst.maxEnergy.v) {
                        local.last = Date.now();
                        save();
                        fast.ecoProxy.setEnergy(fast.ecoProxy.getEnergy() + 1);
                    }
                    else {
                        _running = false;
                    }
                }
            })(nrgProxy = fast.nrgProxy || (fast.nrgProxy = {}));
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            let RewardType;
            (function (RewardType) {
                RewardType[RewardType["NULL"] = 0] = "NULL";
                RewardType[RewardType["COIN"] = 1] = "COIN";
                RewardType[RewardType["DIAMOND"] = 2] = "DIAMOND";
                RewardType[RewardType["ENERGY"] = 3] = "ENERGY";
            })(RewardType = fast.RewardType || (fast.RewardType = {}));
            let rewardProxy;
            (function (rewardProxy) {
                function add(typ, val) {
                    switch (typ) {
                        case RewardType.COIN:
                            fast.ecoProxy.addCoin(val);
                            return;
                        case RewardType.DIAMOND:
                            fast.ecoProxy.addDiamond(val);
                            return;
                        case RewardType.ENERGY:
                            fast.ecoProxy.addEnergy(val);
                            return;
                    }
                }
                rewardProxy.add = add;
                function check(typ, val, tip = true) {
                    switch (typ) {
                        case RewardType.COIN:
                            return fast.ecoProxy.checkCoin(val, tip);
                        case RewardType.DIAMOND:
                            return fast.ecoProxy.checkDiamond(val, tip);
                        case RewardType.ENERGY:
                            return fast.ecoProxy.checkEnergy(val, tip);
                    }
                }
                rewardProxy.check = check;
            })(rewardProxy = fast.rewardProxy || (fast.rewardProxy = {}));
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            var signProxy;
            (function (signProxy) {
                const SAVE_KEY = 'fast.sign';
                var local;
                function save() {
                    Laya.LocalStorage.setItem(SAVE_KEY, JSON.stringify(local));
                }
                signProxy.save = save;
                function load() {
                    local = JSON.parse(Laya.LocalStorage.getItem(SAVE_KEY) || "{}");
                    if (!local.day)
                        local.day = 0; //第几天签到
                    if (!local.time)
                        local.time = 0; //签到的时间记录
                }
                signProxy.load = load;
                /** 是否已经签过到(最近一次签到时间晚于当日0点) */
                function isSigned() {
                    return local.time >= new Date().setHours(0, 0, 0, 0);
                }
                signProxy.isSigned = isSigned;
                /** 调用签到界面 */
                function sign() {
                    if (isSigned()) {
                        return;
                    }
                    local.time = Date.now();
                    local.day += 1;
                    local.double = false;
                    k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                        custom_event_name: '签到',
                        custom_value: local.day
                    });
                    save();
                    mvc.send(fast.MsgKey.ON_SIGNED);
                }
                signProxy.sign = sign;
                /** 再领一次 */
                function double() {
                    local.double = true;
                    save();
                    mvc.send(fast.MsgKey.ON_SIGNED_DOUBLE);
                }
                signProxy.double = double;
                function getDay() {
                    return local.day;
                }
                signProxy.getDay = getDay;
                function isDouble() {
                    return local.double;
                }
                signProxy.isDouble = isDouble;
            })(signProxy = fast.signProxy || (fast.signProxy = {}));
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

(function (passer) {
    var plugin;
    (function (plugin) {
        var fast;
        (function (fast) {
            class SignWindow extends fast.RewardWindow {
                constructor() {
                    super('sign', 'fast');
                }
                bindChild() {
                    super.bindChild();
                    this.stateCtrl = this.getController('c3');
                    this.labels = [];
                    for (let i = 0; i < 7; i += 1) {
                        this.labels[i] = this.getButton('frame.day' + i);
                    }
                }
                refreshUi() {
                    this.stateCtrl.selectedIndex = fast.signProxy.isSigned() ? (fast.signProxy.isDouble() ? 2 : 1) : 0;
                    for (let i in FastSign) {
                        this.labels[i].title = FastSign[i].val + '';
                        this.labels[i].getController('c1').selectedIndex = FastSign[i].type;
                        if (!fast.signProxy.isSigned() && +i == fast.signProxy.getDay())
                            this.labels[i].getController('c2').selectedIndex = 1;
                        else if (fast.signProxy.isSigned() && !fast.signProxy.isDouble() && +i == fast.signProxy.getDay() - 1)
                            this.labels[i].getController('c2').selectedIndex = 1;
                        else
                            this.labels[i].getController('c2').selectedIndex = +i < fast.signProxy.getDay() ? 0 : 2;
                    }
                }
                onClickNextButton() {
                    this.onNext();
                }
                onRewardSuccess() {
                    this.onReward();
                }
                //一倍领取签到
                onNext() {
                    let rw = FastSign[fast.signProxy.getDay()];
                    fast.rewardProxy.add(rw.type, rw.val);
                    fast.signProxy.sign();
                    this.refreshUi();
                }
                //两倍领取签到
                onReward() {
                    let rw = FastSign[fast.signProxy.getDay() - 1];
                    fast.rewardProxy.add(rw.type, rw.val);
                    fast.signProxy.double();
                    this.refreshUi();
                }
            }
            fast.SignWindow = SignWindow;
        })(fast = plugin.fast || (plugin.fast = {}));
    })(plugin = passer.plugin || (passer.plugin = {}));
})(passer || (passer = {}));

//# sourceMappingURL=fast.js.map
