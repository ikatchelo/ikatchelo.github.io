window.k7 = window.k7 || {};

(function (k7) {
    var xsdk;
    (function (xsdk) {
    })(xsdk = k7.xsdk || (k7.xsdk = {}));
})(k7 || (k7 = {}));
/// <reference path="./laya.d.ts" />
/// <reference path="../PlatformWrapper.ts" />

/// <reference path="./laya.d.ts" />
/// <reference path="../PlatformWrapper.ts" />
(function (k7) {
    var xsdk;
    (function (xsdk) {
        class LayaWrapper {
            setStorage(key, value) {
                if (typeof value !== 'string') {
                    value = JSON.stringify(value);
                }
                Laya.LocalStorage.setItem(key, value);
            }
            getStorage(key, parseJson) {
                let value = Laya.LocalStorage.getItem(key);
                return parseJson && value ? JSON.parse(value) : value;
            }
            callFunction(className, functionName, param) {
                return PlatformClass.createClass(className).call(functionName, param);
            }
        }
        xsdk.LayaWrapper = LayaWrapper;
        xsdk.platform = new LayaWrapper();
    })(xsdk = k7.xsdk || (k7.xsdk = {}));
})(k7 || (k7 = {}));
/// <reference path="InterfaceProtocol.ts" />
/// <reference path="./InterfaceCloud.ts" />
/// <reference path="./InterfaceShare.ts" />
/// <reference path="./InterfaceAds.ts" />
/// <reference path="./InterfaceSocial.ts" />

/// <reference path="./InterfaceCloud.ts" />
/// <reference path="./InterfaceShare.ts" />
/// <reference path="./InterfaceAds.ts" />
/// <reference path="./InterfaceSocial.ts" />
(function (k7) {
    var xsdk;
    (function (xsdk) {
        var appid;
        var gameid;
        class AgentManager {
            constructor() {
                this._plugins = {};
            }
            //初始化XSDK.js
            init(o) {
                appid = o.appid;
                gameid = o.gameid;
            }
            loadPlugin(name, plugin) {
                let p = this._plugins[name];
                if (name === 'analytics') {
                    this.getAnalyticsGroup().addPlugin(plugin);
                    return;
                }
                this._plugins[name] = plugin;
            }
            /** 用户系统插件 TODO */
            getUserPlugin() {
                return this._plugins.user;
            }
            /** 支付系统插件 TODO */
            getIAPPlugin() {
                return this._plugins.iap;
            }
            /** 分享模块插件 */
            getSharePlugin() {
                return this._plugins.share;
            }
            /** 社交模块插件(主要是排行榜相关) */
            getSocialPlugin() {
                return this._plugins.social;
            }
            /** 广告模块插件 */
            getAdsPlugin() {
                return this._plugins.ads;
            }
            /** 统计系统插件组 */
            getAnalyticsGroup() {
                return this._plugins.analyticsGroup;
            }
            /** 统计系统插件 */
            getAnalyticsPlugin(name) {
                return this.getAnalyticsGroup().getPlugin(name);
            }
            /** 云变量插件 */
            getCloudPlugin() {
                return this._plugins.cloud;
            }
            /** 视频播放插件 */
            getVideoPlugin() {
                return this._plugins.video;
            }
            /** 基础交互插件 */
            getUiPlugin() {
                return this._plugins.ui;
            }
            /** 返回平台ID，如微信，头条，OPPO，VIVO，AND，IOS等 */
            getPlatformId() {
                return "";
            }
            /** 返回渠道ID，该渠道由导入游戏的场景决定 */
            getChannelId() {
                return "";
            }
            /** 预留TODO */
            getCustomParam() {
                return null;
            }
            getFrameworkVersion() {
                return "K7.XSDK-js_v1.0";
            }
        }
        xsdk.AgentManager = AgentManager;
        xsdk.agentManager = new AgentManager;
    })(xsdk = k7.xsdk || (k7.xsdk = {}));
})(k7 || (k7 = {}));
/// <reference path="InterfaceProtocol.ts" />

/// <reference path="InterfaceProtocol.ts" />
(function (k7) {
    var xsdk;
    (function (xsdk) {
        class AnalyticsEventSender {
            constructor() {
                this._on_launch_time = Date.now();
                this._timed = {};
            }
            get launchTime() {
                return Date.now() - this._on_launch_time;
            }
            logError(err_id, err_msg) {
                this._logEvent(xsdk.analytics.EVT_ERROR, { err_id, err_msg });
            }
            onLaunchStep(data) {
                let now = Date.now();
                if (!data.launch_prev_id && this._launch_prev_id) {
                    data.launch_prev_id = this._launch_prev_id;
                }
                if (!data.launch_step_time && this._launch_prev_time) {
                    data.launch_step_time = now - this._launch_prev_time;
                }
                this._logEvent(xsdk.analytics.EVT_LAUNCHSTEP, data);
                this._launch_prev_id = data.launch_id;
                this._launch_prev_time = now;
            }
            onGuideStep(data) {
                this._logEvent(xsdk.analytics.EVT_GUIDESTEP, data);
            }
            onGameStart(data) {
                this._logEvent(xsdk.analytics.EVT_GAMESTART, data);
                this.logTimedBegin('1', 'Game');
            }
            onGameEnd(data) {
                if (!data.game_time) {
                    let time = this.logTimedEnd('1');
                    data.game_time = time;
                }
                this._logEvent(xsdk.analytics.EVT_GAMEEND, data);
            }
            onVideoShow(data) {
                this._logEvent(xsdk.analytics.EVT_ADSHOW, data);
            }
            onVideoWatch(data) {
                this._logEvent(xsdk.analytics.EVT_ADWATCH, data);
            }
            onVideoComplete(data) {
                this._logEvent(xsdk.analytics.EVT_ADCOMPLETE, data);
            }
            onShareShow(data) {
                this._logEvent(xsdk.analytics.EVT_SHARESHOW, data);
            }
            onShareOpen(data) {
                this._logEvent(xsdk.analytics.EVT_SHAREOPEN, data);
            }
            onShareComplete(data) {
                this._logEvent(xsdk.analytics.EVT_SHARECOMPLETE, data);
            }
            onNavShow(data) {
                this._logEvent(xsdk.analytics.EVT_NAVSHOW, data);
            }
            onNavClick(data) {
                this._logEvent(xsdk.analytics.EVT_NAVCLICK, data);
            }
            onNavComplete(data) {
                this._logEvent(xsdk.analytics.EVT_NAVCOMPLETE, data);
            }
            onLoadComplete(data) {
                this._logEvent(xsdk.analytics.EVT_LOADCOMPLETE, data);
            }
            onWindowShow(data) {
                this._logEvent(xsdk.analytics.EVT_WINDOWSHOW, data);
            }
            onButtonClick(data) {
                this._logEvent(xsdk.analytics.EVT_BUTTONCLICK, data);
            }
            onAbilityChanged(data) {
                this._logEvent(xsdk.analytics.EVT_ABILITYCHANGED, data);
            }
            onStateChanged(data) {
                this._logEvent(xsdk.analytics.EVT_STATECHANGED, data);
            }
            onTaskChanged(data) {
                this._logEvent(xsdk.analytics.EVT_TASKCHANGED, data);
            }
            onCustom(data) {
                this._logEvent(xsdk.analytics.EVT_CUSTOM, data);
            }
            onTimed(data) {
                this._logEvent(xsdk.analytics.EVT_TIMED, data);
            }
            logTimedBegin(evtId, evtName) {
                this._timed[evtId] = { time: Date.now(), name: evtName };
            }
            logTimedEnd(evtId) {
                let data = this._timed[evtId];
                if (data) {
                    this.onTimed({
                        timed_event_id: evtId,
                        timed_event_name: data.name,
                        timed_value: Date.now() - data.time
                    });
                    this._timed[evtId] = undefined;
                    return data.time;
                }
            }
            _logEvent(evtId, evtData) {
                if (!evtData.launch_time)
                    evtData.launch_time = this.launchTime;
                this.logEvent(evtId, evtData);
            }
        }
        xsdk.AnalyticsEventSender = AnalyticsEventSender;
        class AbstractAnalytics extends AnalyticsEventSender {
        }
        xsdk.AbstractAnalytics = AbstractAnalytics;
    })(xsdk = k7.xsdk || (k7.xsdk = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var xsdk;
    (function (xsdk) {
        var ads;
        (function (ads) {
            class AdSupportChecker {
                checkSupported() {
                    if (this.platformObject) {
                        return true;
                    }
                    let p = { type: ads.EVT_FAIL, code: '-1', msg: 'not supported', target: this };
                    if (this.setting) {
                        this.setting.fail && this.setting.fail(p.code, p.msg);
                        this.setting.complete && this.setting.complete(p);
                    }
                    this.callback && this.callback(p.type, p);
                    return false;
                }
            }
            ads.AdSupportChecker = AdSupportChecker;
        })(ads = xsdk.ads || (xsdk.ads = {}));
    })(xsdk = k7.xsdk || (k7.xsdk = {}));
})(k7 || (k7 = {}));
/**
 * 标准事件，概念通用与所有游戏，游戏内的特殊逻辑，可使用自定义的字符串直接上报
 */

/**
 * 标准事件，概念通用与所有游戏，游戏内的特殊逻辑，可使用自定义的字符串直接上报
 */
(function (k7) {
    var xsdk;
    (function (xsdk) {
        var ads;
        (function (ads) {
            ads.EVT_SHOW = 'AD_EVT_SHOW';
            ads.EVT_FAIL = 'AD_EVT_FAIL';
            ads.EVT_CLOSE = 'AD_EVT_CLOSE';
            ads.EVT_LOADED = 'AD_EVT_LOADED';
        })(ads = xsdk.ads || (xsdk.ads = {}));
    })(xsdk = k7.xsdk || (k7.xsdk = {}));
})(k7 || (k7 = {}));
/**
 * 标准事件，概念通用与所有游戏，游戏内的特殊逻辑，可使用自定义的字符串直接上报
 */

/**
 * 标准事件，概念通用与所有游戏，游戏内的特殊逻辑，可使用自定义的字符串直接上报
 */
(function (k7) {
    var xsdk;
    (function (xsdk) {
        var analytics;
        (function (analytics) {
            /** 应用被显示出来(获得焦点) */
            analytics.EVT_SHOW = 'Show';
            /** 应用被隐藏到后台(失去焦点) */
            analytics.EVT_HIDE = 'Hide';
            /** 游戏开始 */
            analytics.EVT_GAMESTART = 'GameStart';
            /** 游戏结束 */
            analytics.EVT_GAMEEND = 'GameEnd';
            /** 激励视频事件入口按钮被展示 */
            analytics.EVT_ADSHOW = 'VideoShow';
            /** 激励视频事件打开视频 */
            analytics.EVT_ADWATCH = 'VideoWatch';
            /** 激励视频事件关闭视频 */
            analytics.EVT_ADCOMPLETE = 'VideoComplete';
            /** 矩阵互导事件，矩阵被展示 */
            analytics.EVT_NAVSHOW = 'ADShow';
            /** 矩阵互导事件，某一个跳转图标被点击 */
            analytics.EVT_NAVCLICK = 'ADClick';
            /** 矩阵互导事件，某一个跳转图标点击后二次确认结果 */
            analytics.EVT_NAVCOMPLETE = 'ADComplete';
            /** 分享事件，按钮被展示 */
            analytics.EVT_SHARESHOW = 'ShareShow';
            /** 分享事件，好友列表被打开 */
            analytics.EVT_SHAREOPEN = 'ShareOpen';
            /** 分享事件，分享行为结束，好友列表关闭返回 */
            analytics.EVT_SHARECOMPLETE = 'ShareComplete';
            /** 自定义事件 */
            analytics.EVT_CUSTOM = 'Custom';
            /** UI按钮被点击 */
            analytics.EVT_BUTTONCLICK = 'ButtonClick';
            /** UI界面被弹出 */
            analytics.EVT_WINDOWSHOW = 'WindowShow';
            /** 任务状态变化事件 */
            analytics.EVT_TASKCHANGED = 'TaskChanged';
            /** 启动流程事件 */
            analytics.EVT_LAUNCHSTEP = 'LaunchStep';
            /** 引导事件 */
            analytics.EVT_GUIDESTEP = 'GuideStep';
            /** 加载完成事件 */
            analytics.EVT_LOADCOMPLETE = 'LoadComplete';
            /** 能力变化事件 */
            analytics.EVT_ABILITYCHANGED = 'AbilityChanged';
            /** 状态变化事件 */
            analytics.EVT_STATECHANGED = 'StateChanged';
            /** 自定义时长事件 */
            analytics.EVT_TIMED = 'Timed';
            /** 错误日志上报事件 */
            analytics.EVT_ERROR = 'Error';
        })(analytics = xsdk.analytics || (xsdk.analytics = {}));
    })(xsdk = k7.xsdk || (k7.xsdk = {}));
})(k7 || (k7 = {}));
/// <reference path="../InterfaceAnalytics.ts" />

/// <reference path="../InterfaceAnalytics.ts" />
(function (k7) {
    var xsdk;
    (function (xsdk) {
        var analytics;
        (function (analytics) {
            class AnalyticsGroup extends xsdk.AnalyticsEventSender {
                constructor() {
                    super(...arguments);
                    this._list = [];
                    this._stack = [];
                }
                static check(p, plugin) {
                    if (!p)
                        return plugin;
                    if (p instanceof analytics.AnalyticsGroup) {
                        p.addPlugin(plugin);
                        return p;
                    }
                    let group = new analytics.AnalyticsGroup();
                    group.addPlugin(p, plugin);
                    return group;
                }
                getList() {
                    return this._list;
                }
                getPlugin(name) {
                    for (let p of this._list) {
                        if (p.getPluginName() === name)
                            return p;
                    }
                    return null;
                }
                addPlugin() {
                    this._list.push(...arguments);
                }
                createABCode() {
                    if (!xsdk.platform)
                        return '';
                    let ab_test = xsdk.platform.getStorage('k7.abtest');
                    if (!ab_test) {
                        let r = Math.floor(Math.random() * 4294967296);
                        ab_test = r.toString(2).replace(/1/g, 'A').replace(/0/g, 'B');
                        while (ab_test.length < 32)
                            ab_test = 'B' + ab_test;
                        xsdk.platform.setStorage('k7.abtest', ab_test);
                        this.setProfile({ ab_test });
                    }
                    return ab_test;
                }
                getABCode(id = 0) {
                    return this.createABCode().charAt(id) == 'A';
                }
                logEvent(evtId, evtData, plugin) {
                    this._stack.push({ evtId, evtData, plugin });
                    if (this._isSending)
                        return;
                    this._isSending = true;
                    setTimeout(this._next.bind(this), 20);
                }
                _next() {
                    if (this._stack.length > 0) {
                        this._send(this._stack.shift());
                        setTimeout(this._next.bind(this), 20);
                    }
                    else {
                        this._isSending = false;
                    }
                }
                _send(action) {
                    for (let plugin of this._list) {
                        plugin.logEvent(action.evtId, action.evtData);
                    }
                }
                setProfile(properties) {
                    for (let plugin of this._list) {
                        plugin.setProfile(properties);
                    }
                }
                setAccount(openId) {
                    for (let plugin of this._list) {
                        plugin.setAccount(openId);
                    }
                }
            }
            analytics.AnalyticsGroup = AnalyticsGroup;
            xsdk.agentManager.loadPlugin('analyticsGroup', new AnalyticsGroup);
        })(analytics = xsdk.analytics || (xsdk.analytics = {}));
    })(xsdk = k7.xsdk || (k7.xsdk = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var xsdk;
    (function (xsdk) {
        function getConf() {
            return window['xsdk_conf'];
        }
        xsdk.getConf = getConf;
    })(xsdk = k7.xsdk || (k7.xsdk = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var xsdk;
    (function (xsdk) {
        class IdIterator {
            constructor(list) {
                this.list = list;
                this.index = 0;
            }
            next() {
                if (this.index < this.list.length) {
                    return this.list[this.index++];
                }
                else {
                    this.index = 0;
                    return this.next();
                }
            }
        }
        xsdk.IdIterator = IdIterator;
    })(xsdk = k7.xsdk || (k7.xsdk = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var xsdk;
    (function (xsdk) {
        /** 将字符串拆成一个数组，每个元素不超过指定大小，用于大字符串拆分序列化 */
        function splitStringToLittleArray(data, size = 255) {
            let res = [];
            let count = Math.floor(data.length / size) + 1;
            for (let i = 0; i < count; i += 1) {
                res.push(data.substr(i * size, size));
            }
            return res;
        }
        xsdk.splitStringToLittleArray = splitStringToLittleArray;
    })(xsdk = k7.xsdk || (k7.xsdk = {}));
})(k7 || (k7 = {}));
