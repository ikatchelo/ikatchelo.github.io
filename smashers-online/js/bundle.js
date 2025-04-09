(function () {
    'use strict';

    Laya.init(720, 1280);
    Laya.stage.bgColor = '#FFFFFF';
    Laya.stage.scaleMode = 'fixedheight';//fixedheight
    Laya.stage.screenMode = 'vertical';
    Laya.stage.alignV = 'middle';
    Laya.stage.alignH = 'center';
    const WAITING = 1500;
    let starttime = Date.now();
    let logoImage = new Laya.Sprite();
    let logoCompelte = false;
    logoImage.alpha = 0;
    Laya.stage.addChild(logoImage);
    logoImage.loadImage('logo.png', new Laya.Handler(null, () => {
        Laya.timer.callLater(undefined, () => {
            logoImage.x = (Laya.stage.width - logoImage.width) / 2;
            logoImage.y = (Laya.stage.height - logoImage.height) / 2;
        });
        Laya.Tween.to(logoImage, { alpha: 1 }, 700, Laya.Ease.quadOut, new Laya.Handler(null, () => {
            k7.xsdk.agentManager.getAnalyticsGroup().onLaunchStep({
                launch_id: '1', launch_name: 'LogoShow'
            });
        }));
        if (window['wx'] && wx.getSystemInfo) {
            wx.getSystemInfo({
                success: res => {
                    k7.xsdk.agentManager.getAnalyticsGroup()
                        .setProfile({ benchmarkLevel: res.benchmarkLevel });
                }
            });
        }
        for (let i of [1, 2, 3, 5, 10, 15, 20, 30, 60]) {
            Laya.timer.once(+i * 60000, undefined, () => {
                k7.xsdk.agentManager.getAnalyticsGroup().onLaunchStep({
                    launch_id: (i < 10 ? '0' : '') + i, launch_name: 'Time'
                });
            });
        }
    }));
    function loadSubpackage() {
        if (typeof wx !== 'undefined') {
            wx.loadSubpackage({
                name: 'sub-main',
                success: loadComplete,
                fail: loadFailed
            });
        }
        else if (typeof qg !== 'undefined') {
            qg.loadSubpackage({
                name: 'sub-main',
                success: loadComplete,
                fail: loadFailed
            });
        }
        else {
            loadLib("sub-main/game.js");
            loadComplete();
        }
    }
    loadSubpackage();
    function loadComplete() {
        let delay = WAITING - (Date.now() - starttime);
        if (delay > 0) {
            Laya.timer.once(delay, null, loadComplete);
            return;
        }
        k7.xsdk.agentManager.getAnalyticsGroup().onLaunchStep({
            launch_id: '2', launch_name: 'LogoEnd'
        });
        Laya.Tween.to(logoImage, { alpha: 0 }, 350, null, new Laya.Handler(null, startup.main));
    }
    let retry = 1;
    function loadFailed() {
        k7.xsdk.agentManager.getAnalyticsGroup().onLoadComplete({
            file_name: 'subpackage',
            load_url: 'subpackage',
            load_time: Date.now() - starttime,
            load_retry: retry,
            load_success: false
        });
        Laya.timer.once(500 * retry, null, () => {
            starttime = Date.now() - WAITING;
            retry += 1;
            loadSubpackage();
        });
    }

}());
