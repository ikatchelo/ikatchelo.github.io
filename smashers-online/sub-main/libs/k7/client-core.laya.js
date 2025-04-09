window.k7 = window.k7 || {};



(function (k7) {
    class LayaEngineAdapter {
        onAddedToStage(engineDisplayObject, callback, caller) {
            engineDisplayObject.on(Laya.Event.DISPLAY, caller, callback);
        }
        onRemovedFromStage(engineDisplayObject, callback, caller) {
            engineDisplayObject.on(Laya.Event.UNDISPLAY, caller, callback);
        }
        onClick(engineDisplayObject, callback, caller, args) {
            engineDisplayObject.on(Laya.Event.CLICK, caller, callback, [args]);
        }
        setCallback(callback, caller) {
            return new Laya.Handler(caller, callback);
        }
        onInput(engineObject, callback, caller) {
            engineObject.on(Laya.Event.INPUT, caller, callback);
        }
        onFingerDrag(engineDisplayObject, delay, callback, caller) {
            if (this._finger)
                return;
            this._finger = {
                container: engineDisplayObject,
                delay, callback, caller, working: false
            };
            engineDisplayObject.on(Laya.Event.MOUSE_DOWN, this, this._onFingerDown);
            engineDisplayObject.on(Laya.Event.MOUSE_UP, this, this._onFingerUp);
        }
        _onFingerDown() {
            this._finger.working = true;
            this._finger.callback && this._finger.callback.call(this._finger.caller, this._setCallbackParam(this._finger.container, 'down'));
            Laya.timer.once(this._finger.delay, this, this._onFingerStart);
        }
        _onFingerStart() {
            if (!this._finger.working)
                return;
            this._finger.callback && this._finger.callback.call(this._finger.caller, this._setCallbackParam(this._finger.container, 'start'));
            this._finger.container.on(Laya.Event.MOUSE_MOVE, this, this._onFingerMove);
        }
        _onFingerMove() {
            this._finger.callback && this._finger.callback.call(this._finger.caller, this._setCallbackParam(this._finger.container, 'move'));
        }
        _onFingerUp() {
            this._finger.container.off(Laya.Event.MOUSE_MOVE, this, this._onFingerMove);
            this._finger.callback && this._finger.callback.call(this._finger.caller, this._setCallbackParam(this._finger.container, 'up'));
            this._finger.working = false;
        }
        _setCallbackParam(container, type) {
            let p = container.globalToLocal(Laya.Point.TEMP.setTo(Laya.stage.mouseX, Laya.stage.mouseY));
            return { type, x: p.x, y: p.y };
        }
    }
    k7.LayaEngineAdapter = LayaEngineAdapter;
    k7.engine = new LayaEngineAdapter();
})(k7 || (k7 = {}));





(function (k7) {
    class LayaFairyAdapter {
        loadPack(url, progressCallback, completeCallback, caller) {
            fgui.UIPackage.loadPackage(url, k7.engine.setCallback(completeCallback, caller));
        }
        playTransition(comp, id, callback, caller) {
            let trans = comp.getTransition(id);
            trans && trans.play(k7.engine.setCallback(callback, caller));
            return trans;
        }
        setFairyHook(trans, label, callback, caller) {
            trans && trans.setHook(label, k7.engine.setCallback(callback, caller));
        }
        setItemRenderer(list, listener, caller) {
            list && (list.itemRenderer = k7.engine.setCallback(listener, caller));
        }
        setItemClick(list, listener, caller) {
            list.on(FEvent.CLICK_ITEM, caller, listener);
        }
        listenStageEvent(displayObject) {
            if (displayObject) {
                displayObject.displayObject.on(Laya.Event.ADDED, this, () => {
                    mvc.send(k7.EVT_STAGE_ADDED, displayObject);
                });
                displayObject.displayObject.on(Laya.Event.REMOVED, this, () => {
                    mvc.send(k7.EVT_STAGE_REMOVED, displayObject);
                });
                displayObject.displayObject.on(Laya.Event.RESIZE, this, () => {
                    mvc.send(k7.EVT_STAGE_RESIZE, displayObject);
                });
            }
        }
        /**
         * 添加一个龙骨显示对象到Fairy的显示列表中
         * @param sk 龙骨动画的资源
         * @param autoRemove 播放完是否自动从显示对象中移除
         * @returns 返回引擎原生的龙骨播放对象
         */
        addSkeleton(comp, sk, checkRepeat) {
            if (!sk)
                return null;
            if (!sk.templet)
                return null;
            let parent = comp.displayObject;
            if (checkRepeat) {
                for (let i = 0; i < parent.numChildren; i += 1) {
                    let child = parent.getChildAt(i);
                    if (child instanceof Laya.Skeleton && child.templet === sk.templet) {
                        sk.bind(child);
                        return child;
                    }
                }
            }
            let nsk = sk.create().curr();
            parent.addChild(nsk);
            return nsk;
        }
    }
    k7.LayaFairyAdapter = LayaFairyAdapter;
    k7.fairy = new LayaFairyAdapter();
})(k7 || (k7 = {}));



(function (k7) {
    class LayaLoaderAdapter {
        loadRes(url, type, callback, caller) {
            if (Laya.Browser.onMiniGame && type === 'sound') {
                let wxSound = wx.createInnerAudioContext();
                function canplay() {
                    caller ? callback.call(caller, wxSound) : callback(wxSound);
                    wxSound.offCanplay(canplay);
                }
                callback && wxSound.onCanplay(canplay);
                wxSound.src = url;
            }
            else {
                Laya.loader.load(url, k7.engine.setCallback(callback, caller), null, type);
            }
        }
    }
    k7.LayaLoaderAdapter = LayaLoaderAdapter;
    k7.loader = new LayaLoaderAdapter();
})(k7 || (k7 = {}));



(function (k7) {
    class LayaSkeletonAdapter {
        create() {
            return new LayaSkeleton();
        }
    }
    k7.LayaSkeletonAdapter = LayaSkeletonAdapter;
    class LayaSkeleton {
        constructor() {
            /** 同一个素材里的动画信息 */
            this.aniInfo = [];
            /** 原生引擎的播放实例回收池 */
            this.instPool = [];
        }
        /** 加载该动画资源 */
        load(url, callback, caller) {
            if (!this.templet) {
                this.templet = new Laya.Templet();
                this.templet.on(Laya.Event.COMPLETE, this, this.onComplete);
                this.templet.on(Laya.Event.ERROR, this, this.onError);
            }
            this.loadHandler = new Laya.Handler(caller, callback);
            this.templet.loadAni(url);
            return this;
        }
        onComplete() {
            this.loadHandler && this.loadHandler.run();
            this.loadHandler = null;
        }
        onError() {
            this.templet.offAll();
            this.templet = null;
            this.loadHandler && this.loadHandler.run();
        }
        create() {
            if (this.instPool.length > 0) {
                this.skeleton = this.instPool.pop();
            }
            else {
                this.skeleton = this.templet.buildArmature();
            }
            return this;
        }
        bind(nsk) {
            if (nsk.templet === this.templet) {
                this.skeleton = nsk;
            }
            return this;
        }
        curr() {
            return this.skeleton;
        }
        /** 单次播放 */
        play(index, addMode) {
            this.skeleton.blendMode = addMode ? 'lighter' : null;
            this.skeleton.play(index, false);
            return this;
        }
        /** 循环播放 */
        loop(index, addMode) {
            this.skeleton.blendMode = addMode ? 'lighter' : null;
            this.skeleton.play(index, true);
            return this;
        }
        /** 设置播放比例 */
        rate(value) {
            this.skeleton.playbackRate(value);
            return this;
        }
        /** 停止播放 */
        stop() {
            this.skeleton.stop();
            return this;
        }
        /** 回收播放器 */
        recycle() {
            this.stop().remove();
            this.instPool.push(this.skeleton);
            this.skeleton = null;
            return this;
        }
        /** 从显示列表移除 */
        remove() {
            this.skeleton.parent && this.skeleton.parent.removeChild(this.skeleton);
            return this;
        }
    }
    k7.LayaSkeleton = LayaSkeleton;
    k7.skeleton = new LayaSkeletonAdapter();
})(k7 || (k7 = {}));



(function (k7) {
    class LayaSoundAdapter {
        create(engineSound, fileName) {
            return Laya.Browser.onMiniGame
                ? new WxSound(engineSound, fileName)
                : new LayaSound(engineSound, fileName);
        }
    }
    k7.LayaSoundAdapter = LayaSoundAdapter;
    class LayaSound {
        constructor(source, fileName) {
            this._sound = source || new Laya.Sound();
        }
        play() {
            return new LayaSoundChannel(this._sound.play(0, 1));
        }
        loop() {
            return new LayaSoundChannel(this._sound.play(0, 0));
        }
    }
    k7.LayaSound = LayaSound;
    class LayaSoundChannel {
        constructor(channel) {
            this._channel = channel;
        }
        play() {
            if (!this._channel)
                return this;
            this._channel.loops = 1;
            this._channel.play();
            return this;
        }
        loop() {
            if (!this._channel)
                return this;
            this._channel.loops = 0;
            this._channel.play();
            return this;
        }
        stop() {
            if (!this._channel)
                return this;
            this._channel.stop();
            return this;
        }
        onComplete(callback, caller) {
            if (!this._channel)
                return this;
            this._channel.completeHandler = k7.engine.setCallback(callback, caller);
        }
        setVolume(value) {
            if (!this._channel)
                return this;
            this._channel.volume = value;
            return this;
        }
        getVolume() {
            return this._channel ? this._channel.volume : 0;
        }
        setRate(value) {
            //TODO
            return this;
        }
    }
    k7.LayaSoundChannel = LayaSoundChannel;
    //微信不区分Sound和Channel，所以当一个对象播放多个声音实例的时候，
    //play返回的实例将会配合缓存读取(多次播放时，可能不是本身)
    const wxSoundCache = {};
    var wxSoundId = 0;
    class WxSound {
        constructor(source, fileName) {
            this._id = wxSoundId += 1;
            this._fileName = fileName;
            this._sound = source || wx.createInnerAudioContext();
            this._sound.onEnded(this.onEnded.bind(this));
            let cache = wxSoundCache[this.name];
            if (!cache)
                wxSoundCache[this.name] = cache = [];
            cache.push(this);
        }
        get name() { return this._fileName; }
        get playing() { return this._playing; }
        cloneAndPlay(loop = false) {
            let source = wx.createInnerAudioContext();
            source.autoplay = true;
            source.loop = loop;
            source.src = this._sound.src;
            let newInst = new WxSound(source, this._fileName);
            newInst._playing = true;
            return newInst;
        }
        checkCache() {
            let cache = wxSoundCache[this._fileName];
            for (let i = 0; i < cache.length; i += 1) {
                if (!cache[i].playing)
                    return cache[i];
            }
            return null;
        }
        _play(loop = false) {
            this._sound.loop = loop;
            this._sound.play();
            this._playing = true;
            return this;
        }
        play() {
            if (!this._playing) {
                return this._play();
            }
            let cacheSound = this.checkCache();
            if (cacheSound) {
                return cacheSound._play();
            }
            else {
                return this.cloneAndPlay();
            }
        }
        loop() {
            if (!this._playing) {
                return this._play(true);
            }
            let cacheSound = this.checkCache();
            if (cacheSound) {
                return cacheSound._play(true);
            }
            else {
                return this.cloneAndPlay(true);
            }
        }
        stop() {
            this._sound.stop();
            this._playing = false;
            return this;
        }
        onEnded() {
            this._playing = false;
            this.completeHandler && this.completeHandler.run();
        }
        onComplete(callback, caller) {
            this.completeHandler = k7.engine.setCallback(callback, caller);
        }
        setVolume(value) {
            this._sound.volume = value;
            return this;
        }
        getVolume() {
            return this._sound.volume;
        }
        setRate(value) {
            this._sound.playbackRate = value;
            return this;
        }
    }
    k7.WxSound = WxSound;
    k7.sound = new LayaSoundAdapter();
})(k7 || (k7 = {}));



(function (k7) {
    class LayaTimerAdapter {
        delay(time, callback, caller) {
            Laya.timer.once(time, caller, callback);
        }
        later(frame, callback, caller) {
            Laya.timer.frameOnce(frame, caller, callback);
        }
        loop(duration, callback, caller) {
            Laya.timer.loop(duration, caller, callback);
        }
        frame(delay, callback, caller) {
            Laya.timer.frameLoop(delay, caller, callback);
        }
        clear(callback, caller) {
            Laya.timer.clear(caller, callback);
        }
    }
    k7.LayaTimerAdapter = LayaTimerAdapter;
    k7.timer = new LayaTimerAdapter();
})(k7 || (k7 = {}));



(function (k7) {
    class LayaTweenAdapter {
        to(target, props, duration, ease) {
            return new LayaTween(target).to(props, duration, ease).play();
        }
        update(engineObject, callback, caller) {
            engineObject.update = new Laya.Handler(caller, callback);
        }
    }
    k7.LayaTweenAdapter = LayaTweenAdapter;
    class LayaTween {
        constructor(target) {
            /** 是否缓存原生缓动播放器 */
            this.instCache = true;
            this._target = target === 0 ? { value: 0 } : target;
            this._asyncIndex = 0;
            this._asyncStack = [];
        }
        _complete() {
            let action = this._asyncStack[this._asyncIndex];
            if (action.complete && action.caller)
                action.complete.call(action.caller);
            else
                action.complete && action.complete();
            if (this._asyncIndex + 1 < this._asyncStack.length) {
                this._asyncIndex += 1;
                this.play();
            }
            else {
                this._asyncIndex = 0;
                this._currIndex = -1;
                this._asyncStack = [];
            }
        }
        play() {
            if (this._asyncIndex === this._currIndex)
                return;
            this._currIndex = this._asyncIndex;
            let action = this._asyncStack[this._asyncIndex];
            if (!this.instCache || !this.engineObject)
                this.engineObject = new Laya.Tween();
            this.engineObject.to(this._target, action.props, action.duration, action.ease, k7.engine.setCallback(this._complete, this), action.delay);
            return this;
        }
        stop() {
            this.engineObject.clear();
            return this;
        }
        to(props, duration, ease) {
            if (typeof props === 'number') {
                props = { value: props };
            }
            let action = this._asyncStack.length > 0
                ? this._asyncStack[this._asyncStack.length - 1]
                : null;
            if (action && action.props === undefined && action.duration === undefined) {
                action.props = props;
                action.duration = duration;
                action.ease = ease;
            }
            else {
                this._asyncStack.push({ props, duration, ease });
            }
            return this;
        }
        from(props, duration, ease) {
            //TODO
            return this;
        }
        wait(duration) {
            this._asyncStack.push({ delay: duration });
            return this;
        }
        call(callback, caller) {
            let action = this._asyncStack[this._asyncStack.length - 1];
            if (action.complete === undefined) {
                action.complete = callback;
                action.caller = caller;
            }
            else {
                this._asyncStack.push({ complete: callback, caller });
            }
            return this;
        }
        set(props) {
            this._asyncStack.push({ duration: 0, props });
            return this;
        }
    }
    k7.LayaTween = LayaTween;
    k7.tween = new LayaTweenAdapter();
})(k7 || (k7 = {}));

window.k7 = window.k7 || {};

window.GObject = fgui.GObject;
window.GComponent = fgui.GComponent;
window.GButton = fgui.GButton;
window.GLabel = fgui.GLabel;
window.GProgressBar = fgui.GProgressBar;
window.GTextField = fgui.GTextField;
window.GRichTextField = fgui.GRichTextField;
window.GTextInput = fgui.GTextInput;
window.GLoader = fgui.GLoader;
window.GList = fgui.GList;
window.GTree = fgui.GTree;
window.GGraph = fgui.GGraph;
window.GGroup = fgui.GGroup;
window.GSlider = fgui.GSlider;
window.GComboBox = fgui.GComboBox;
window.GImage = fgui.GImage;
window.GMovieClip = fgui.GMovieClip;
window.GController = fgui.Controller;
window.GTransition = fgui.Transition;
window.GWindow = fgui.Window;
window.GRoot = fgui.GRoot;
window.FUIPackage = fgui.UIPackage;
window.FEvent = fgui.Events;

(function (k7) {
    k7.EVT_STAGE_ADDED = 'K7_EVT_STAGE_ADDED';
    k7.EVT_STAGE_REMOVED = 'K7_EVT_STAGE_REMOVED';
    k7.EVT_STAGE_RESIZE = 'K7_EVT_STAGE_RESIZE';
})(k7 || (k7 = {}));






(function (k7) {
    k7.EVT_FAIRY_CLICK = 'EVT_FAIRY_CLICK';
    k7.EVT_FAIRY_READY = 'EVT_FAIRY_READY';
    /**
     * 自己创建FairyChild或子类，需要手动调用bindChild,如let f = new k7.FairyChild().bindChild();
     */
    class FairyChild {
        constructor(viewComponent, owner) {
            this._childDict = {};
            this._windowDict = {};
            this.setRoot(viewComponent, owner);
        }
        setRoot(viewRoot, owner) {
            this.setView(viewRoot);
            this.owner = owner || this;
            return this;
        }
        setView(view) {
            this.viewComponent = view;
            return this;
        }
        getView() {
            return this.viewComponent;
        }
        setXY(x, y) {
            if (typeof x == 'number')
                this.viewComponent.x = x;
            if (typeof y == 'number')
                this.viewComponent.y = y;
            return this;
        }
        bindChild() { return this; }
        onClickButton(button) {
            if (this.owner != this)
                this.owner.onClickButton(button);
        }
        onCloseSubWindow(window) {
            if (this.owner != this)
                this.owner.onCloseSubWindow(window);
        }
        onListRenderer(item, index) {
            if (this.owner != this)
                this.owner.onListRenderer(item, index);
        }
        onClickItem(item) {
            if (this.owner != this)
                this.owner.onClickItem(item);
        }
        /** 监听所有按钮类型的事件发布，暂未应用，必要性，有待论证 */
        listenAllButton(view) {
            for (let i = 0; i < view.numChildren; ++i) {
                let child = view.getChildAt(i);
                if (child.asButton) {
                    k7.engine.onClick(child, this._click, this, { tar: child });
                }
                else if (child.asCom) {
                    this.listenAllButton(child.asCom);
                }
            }
        }
        _click(par) {
            mvc.send(k7.EVT_FAIRY_CLICK, par.tar);
            this.onClickButton(par.tar.asButton);
            par.cb && par.cb.call(this.owner);
        }
        _itemRenderer(index, view) {
            let item = k7.getListItem(view);
            item.onRenderer(index);
            item.owner && item.owner.onListRenderer(item, index);
        }
        _itemClick(view) {
            let item = k7.getListItem(view);
            item.onClick();
            item.owner && item.owner.onClickItem(item);
        }
        /**
         * 根据点运算符获取末端对象
         * @param path 点运算路径
         * @param view 要获取的对象的相对更路径
         * @param type 要获取对象的类型（全小写的对象类型名称）
         */
        getObj(path, view, type = 'component') {
            var pathStr = path.split(".");
            var len = pathStr.length;
            if (view == null)
                view = this.viewComponent;
            for (var i = 0; i < len - 1; ++i) {
                view = view.getChild(pathStr[i]).asCom;
                if (view == null)
                    return null;
            }
            switch (type) {
                case 'controller': return view ? view.getController(pathStr[i]) : null;
                case 'transition': return view ? view.getTransition(pathStr[i]) : null;
            }
            return view ? view.getChild(pathStr[i]) : null;
        }
        getFairy(path, type = FairyChild) {
            if (!this._childDict[path]) {
                this._childDict[path] = new type(this.getComp(path));
                this._childDict[path].bindChild();
            }
            return this._childDict[path];
        }
        getComp(path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asCom;
        }
        getButton(path, clickListener, parent) {
            if (parent == null)
                parent = this.viewComponent;
            var gobj = this.getObj(path, parent);
            if (gobj != null) {
                k7.engine.onClick(gobj, this._click, this, { tar: gobj, cb: clickListener });
            }
            return gobj == null ? null : gobj.asButton;
        }
        getLabel(path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asLabel;
        }
        getProgressBar(path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asProgress;
        }
        getTextField(path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asTextField;
        }
        getRichTextField(path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asRichTextField;
        }
        getTextInput(path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asTextInput;
        }
        getLoader(path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asLoader;
        }
        getList(path, type = k7.FairyListItem) {
            var gobj = this.getObj(path);
            if (!gobj || !gobj.asList)
                return null;
            let list = gobj.asList;
            k7.registerListItem(list, type, this);
            k7.fairy.setItemRenderer(list, this._itemRenderer, this);
            k7.fairy.setItemClick(list, this._itemClick, this);
            return list;
        }
        getGraph(path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asGraph;
        }
        getGroup(path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asGroup;
        }
        getSlider(path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asSlider;
        }
        getComboBox(path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asComboBox;
        }
        getImage(path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asImage;
        }
        getMovieClip(path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asMovieClip;
        }
        getController(path) {
            return this.getObj(path, null, 'controller');
        }
        getTransition(path) {
            return this.getObj(path, null, 'transition');
        }
        getSubWindow(name, closeListener, parent) {
            if (parent == null)
                parent = this.viewComponent;
            if (this._windowDict[name] == null) {
                var win = new AniWindow(parent.getChild(name).asCom);
                if (win.closeButton == null) {
                    win.closeButton = win.contentPane.getChild("closeButton");
                }
                if (win.closeButton != null) {
                    k7.engine.onClick(win.closeButton, () => {
                        if (closeListener != null) {
                            closeListener.apply(this.owner);
                        }
                        this.onCloseSubWindow(win);
                    });
                }
                this._windowDict[name] = win;
            }
            return this._windowDict[name];
        }
        getBoundsRect() {
            return this.viewComponent ? {
                width: this.viewComponent.width,
                height: this.viewComponent.height,
                x: this.viewComponent.x,
                y: this.viewComponent.y
            } : null;
        }
    }
    k7.FairyChild = FairyChild;
    k7.FairyChildTemp = new FairyChild();
    class AniWindow extends GWindow {
        constructor(comp) {
            super();
            this.contentPane = comp;
            this.modal = true;
            if (this.closeButton == null) {
                this.closeButton = comp.getChild("closeButton");
            }
        }
        doShowAnimation() {
            this.touchable = false;
            if (!k7.fairy.playTransition(this.contentPane, 'show', this, this.onShowAniComplete)) {
                this.onShowAniComplete();
            }
        }
        onShowAniComplete() {
            this.touchable = true;
            this.onShown();
        }
        doHideAnimation() {
            this.touchable = false;
            if (!k7.fairy.playTransition(this.contentPane, 'hide', this, this.hideImmediately)) {
                this.hideImmediately(); //ccc回调有BUG
            }
        }
    }
    k7.AniWindow = AniWindow;
    function getFairyPath(obj) {
        let path = obj.name;
        while (obj.parent && obj.parent != GRoot.inst) {
            if (obj.parent.parent != null &&
                !(obj.parent.parent instanceof GWindow)) {
                path = obj.parent.name + '/' + path;
            }
            obj = obj.parent;
        }
        return path;
    }
    k7.getFairyPath = getFairyPath;
    k7.fairyUrlLocalPrefix = '';
    k7.fairyUrlRemotePrefix = '';
})(k7 || (k7 = {}));



(function (k7) {
    class AppComp extends GComponent {
        constructor(viewComponent, pack) {
            super();
            this._eventList = [];
            if (!viewComponent)
                return;
            if (typeof viewComponent === "string") {
                if (pack && !FUIPackage.getByName(pack)) {
                    FUIPackage.addPackage('' + pack); //前缀TODO
                }
                this.name = viewComponent;
                this.contentPane = FUIPackage.createObject(pack, viewComponent).asCom;
            }
            else {
                this.contentPane = viewComponent.asCom;
            }
            this.addChild(this.contentPane);
            this._adapter = new k7.FairyMediator(this.contentPane, this, this.name);
            mvc.on(k7.EVT_STAGE_RESIZE, this, this.onResize);
            this.bindChild();
        }
        bindChild() { }
        onResize() { }
        show() {
            mvc.registerMediator(this);
            GRoot.inst.addChild(this);
        }
        hideImmediately() {
            GRoot.inst.removeChild(this);
            mvc.removeMediator(this.mediatorName);
        }
        //IFairyChildOnwer
        onClickButton(button) { }
        onCloseSubWindow(window) { }
        onClickItem(item) { }
        onListRenderer(item, index) { }
        setRoot(view) { this._adapter.setRoot(view); }
        getComp(path) { return this._adapter.getComp(path); }
        getLabel(path) { return this._adapter.getLabel(path); }
        getProgressBar(path) { return this._adapter.getProgressBar(path); }
        getTextField(path) { return this._adapter.getTextField(path); }
        getRichTextField(path) { return this._adapter.getRichTextField(path); }
        getTextInput(path) { return this._adapter.getTextInput(path); }
        getLoader(path) { return this._adapter.getLoader(path); }
        getGraph(path) { return this._adapter.getGraph(path); }
        getGroup(path) { return this._adapter.getGroup(path); }
        getSlider(path) { return this._adapter.getSlider(path); }
        getComboBox(path) { return this._adapter.getComboBox(path); }
        getImage(path) { return this._adapter.getImage(path); }
        getMovieClip(path) { return this._adapter.getMovieClip(path); }
        getController(path) { return this._adapter.getController(path); }
        getTransition(path) { return this._adapter.getTransition(path); }
        getButton(path, clickListener, parent) {
            return this._adapter.getButton(path, clickListener, parent);
        }
        getSubWindow(path, closeListener, parent) {
            return this._adapter.getSubWindow(path, closeListener, parent);
        }
        getFairy(path, type = k7.FairyChild) {
            return this._adapter.getFairy(path, type);
        }
        getList(path, type = k7.FairyListItem) {
            return this._adapter.getList(path, type);
        }
        //mvc.IMediator
        get mediatorName() { return this._adapter.mediatorName; }
        get viewComponent() { return this; }
        get eventList() { return this._eventList; }
        set eventList(value) { this._eventList = value; }
        onEvent(eventName, params) { }
        onRegister() { this._adapter.onRegister(); }
        onRemove() { this._adapter.onRemove(); }
    }
    k7.AppComp = AppComp;
})(k7 || (k7 = {}));



(function (k7) {
    class DebugComp extends k7.AppComp {
        constructor() {
            super('DebugComp', 'basic_comp');
            this.timestamp = [];
            this.eventList = ['hide', 'cls'];
        }
        count(times = 10, limit = 3500) {
            let f = Date.now();
            this.timestamp.push(f);
            while (this.timestamp[0] < f - limit) {
                this.timestamp.pop();
            }
            if (this.timestamp.length >= times) {
                this.timestamp = [];
                this.show();
            }
            return this;
        }
        bindChild() {
            this.textInput = this.getTextInput('input');
            this.textOutput = this.getTextInput('output');
            k7.engine.onInput(this.textInput, this.onInput, this);
        }
        show() {
            super.show();
            this.y = GRoot.inst.height;
            k7.tween
                .to(this, { y: GRoot.inst.height - this.contentPane.height }, 200)
                .call(this.requestFocus, this);
        }
        onInput() {
            if (this.textInput.text.lastIndexOf('\n') !== -1) {
                this.textInput.text = '';
                mvc.send(this.command);
            }
            else {
                this.command = this.textInput.text;
            }
        }
        onEvent(evtName) {
            switch (evtName) {
                case 'hide':
                    this.hide();
                    return;
                case 'cls':
                    this.textOutput.text = '';
                    return;
            }
        }
        log(str) {
            if (this.textOutput.text)
                this.textOutput.text += '\n';
            this.textOutput.text += str;
            return this;
        }
        hide() {
            k7.tween
                .to(this, { y: GRoot.inst.height }, 200)
                .call(this.hideImmediately, this);
        }
    }
    k7.DebugComp = DebugComp;
    var debug;
    function debugCount(times = 10, limit = 3500) {
        if (!debug)
            debug = new DebugComp();
        return debug.count(times, limit);
    }
    k7.debugCount = debugCount;
    function debugLog(str) {
        if (!debug)
            debug = new DebugComp();
        return debug.log(str);
    }
    k7.debugLog = debugLog;
})(k7 || (k7 = {}));

(function (k7) {
    /**
     * 贝塞尔曲线路径执行器，将任何带有XY属性的对象放入路径器，
     * 由路径器沿着起点到终点划出一条直线，沿直线两侧随机设定一个贝塞尔顶点，并播放
     * 构造时传入对象，开始运动时传入起点终点与运动时间。
     */
    class BezierPath {
        constructor(centroid, onComplete) {
            this.centroid = centroid;
            this.onComplete = onComplete;
        }
        get particle() {
            return this.centroid;
        }
        /**
         * 设定起点终点及时间，运行期按规则曲线操作对象
         * @param x 起点坐标
         * @param y 起点坐标
         * @param tx 终点坐标
         * @param ty 终点坐标
         * @param time 整体运动时长
         */
        start(x, y, tx, ty, time) {
            this.bezierPoints = this.createBezierPoint(x, y, tx, ty);
            k7.tween.to(0, 1, time, this.ease.bind(this)).call(this.complete, this);
        }
        /**
         * 设定终点及时间，运行期按规则曲线操作对象
         * @param tx 终点坐标（起点为当前坐标）
         * @param ty 终点坐标（起点为当前坐标）
         * @param time 整体运动时长
         */
        to(tx, ty, time) {
            this.start(this.centroid.x, this.centroid.y, tx, ty, time);
        }
        createBezierPoint(x, y, tx, ty) {
            let ox = tx - x, oy = ty - y;
            let l = Math.sqrt(ox * ox + oy * oy);
            let r = Math.atan2(oy, ox) + Math.random() - .5; //随机旋转45度
            let vx = Math.cos(r) * l / 3 * 2;
            let vy = Math.sin(r) * l / 3 * 2;
            return [
                { x, y },
                { x: x + vx, y: y + vy },
                { x: tx, y: ty }
            ];
        }
        ease(t, b, c, d) {
            let { x, y } = k7.getBezierPoint(this.bezierPoints, t / d);
            this.centroid.x = x;
            this.centroid.y = y;
            return k7.easeNone(t, b, c, d);
        }
        complete() {
            this.centroid.x = this.bezierPoints[this.bezierPoints.length - 1].x;
            this.centroid.y = this.bezierPoints[this.bezierPoints.length - 1].y;
            this.onComplete && this.onComplete();
        }
    }
    k7.BezierPath = BezierPath;
})(k7 || (k7 = {}));

(function (k7) {
    var bezierPool;
    class BezierRunner {
        /**
         *
         * @param container 粒子所在容器(叠加在容器上设置)
         * @param imgUrl 粒子纹理
         * @param quantity 粒子数量，大于0的整数
        */
        constructor(container, quantity = 1, pool) {
            if (!pool && !bezierPool)
                bezierPool = {
                    cache: [],
                    urls: ['st0', 'st1', 'st2', 'st3', 'st4', 'st5', 'st6']
                };
            this.particle = new k7.Particle(container, pool || bezierPool);
            this.particle.center = { x: 0, y: 0 };
            this.quantity = quantity;
            this.bezierPath = new k7.BezierPath(this.particle.center);
        }
        start(x, y, tx, ty, time) {
            this.bezierPath.start(x, y, tx, ty, time);
            this.particle.serial = true;
            for (let i = 0; i < this.quantity; i += 1) {
                this.particle.burst();
            }
        }
    }
    k7.BezierRunner = BezierRunner;
})(k7 || (k7 = {}));

(function (k7) {
    var fingerPool;
    class FingerRunner {
        /**
         *
         * @param container 粒子所在容器(叠加在容器上设置)
         * @param imgUrl 粒子纹理
         * @param quantity 粒子数量，大于0的整数
        */
        constructor(container, quantity = 1, pool) {
            if (!pool && !fingerPool)
                fingerPool = {
                    cache: [],
                    urls: ['fv0']
                };
            this.particle = new k7.Particle(container, pool || fingerPool);
            this.quantity = quantity;
        }
        startListener(delay = 200) {
            k7.engine.onFingerDrag(this.particle.container.displayObject, delay, this.onFinger, this);
        }
        onFinger(evt) {
            if (evt.type == 'start') {
                this.particle.center = { x: evt.x, y: evt.y };
                this.particle.serial = true;
                this.particle.burst();
            }
            else if (evt.type == 'move') {
                this.particle.center.x = evt.x;
                this.particle.center.y = evt.y;
            }
            else if (evt.type == 'up') {
                this.particle.serial = false;
            }
        }
    }
    k7.FingerRunner = FingerRunner;
})(k7 || (k7 = {}));

(function (k7) {
    function overfire(root, quantity) {
        let fl = new k7.FireworksRunner(root, quantity || 48);
        let fr = new k7.FireworksRunner(root, quantity || 48);
        fl.particle.setScale(1.5, 2);
        fr.particle.setScale(1.5, 2);
        fl.setVector(Math.PI * 1.6, .8).start(0, root.height / 2);
        fr.setVector(Math.PI * 1.4, .8).start(root.width, root.height / 2);
    }
    k7.overfire = overfire;
    var fireworksPool;
    class FireworksRunner {
        /**
         *
         * @param container 粒子所在容器(叠加在容器上设置)
         * @param imgUrl 粒子纹理
         * @param quantity 粒子数量，大于0的整数
         */
        constructor(container, quantity = 1, pool) {
            this._vsn = .05;
            this._vsm = .4;
            this._gsn = 0.0011;
            this._gsm = 0.0013;
            this._rssn = -8;
            this._rssm = 8;
            this._ast = 600;
            this._ass = .006;
            this._v0r = -Math.PI / 2;
            this._v0s = 0.6;
            if (!pool && !fireworksPool)
                fireworksPool = {
                    cache: [],
                    urls: ['fw0', 'fw1', 'fw2', 'fw3']
                };
            this.particle = new k7.Particle(container, pool || fireworksPool);
            this.particle.setAlpha(1);
            this.particle.create = this.createOne.bind(this);
            //==置换函数引用，实现继承逻辑==
            this.particleReset = this.particle.reset.bind(this.particle);
            this.particle.reset = this.resetOne.bind(this);
            //============================
            this.particle.start = () => { };
            this.quantity = quantity;
        }
        createOne() {
            let r = Math.floor(Math.random() * this.particle.pool.urls.length);
            let u = this.particle.pool.urls[r];
            return new Spark(u.substr(0, 5) === 'ui://' ?
                FUIPackage.createObjectFromURL(u).asImage :
                FUIPackage.createObject('basic_effect', u).asImage);
        }
        /** 以min-max像素/每毫秒的速度，随机爆出一颗粒子(默认0.05~0.4) */
        setV0(min, max) {
            this._vsn = min;
            this._vsm = max || min;
            return this;
        }
        /** 在min-max之间，随机设置一颗粒子垂直重力加速度(单位：像素/每毫秒)(默认0011~0014) */
        setGravity(min, max) {
            this._gsn = min;
            this._gsm = max || min;
            return this;
        }
        /** 在min~max之间，随机设置一颗粒子自转初始角速度(默认±8) */
        setRotationSpeed(min, max) {
            this._rssn = min;
            this._rssm = max || min;
            return this;
        }
        /** 设置烟花从什么时候开始消失，以每帧多少透明度的速度递减 */
        setAlphaSpeed(time, speed) {
            this._ast = time;
            this._ass = speed;
            return this;
        }
        /**
         * 烟花的喷射方向与初速度，及阻力系数
         * @param radian 弧度，默认：-½π(向上)
         * @param v0 初速度，默认：0.6px/s
         * @param air TODO，默认：0
         */
        setVector(radian, v0, air) {
            this._v0r = radian;
            v0 !== undefined && (this._v0s = v0);
            air !== undefined && (this._air = 0);
            return this;
        }
        resetOne(par) {
            this.particleReset(par); //同理与：super.resetOne
            let sv = Math.random() * (this._vsm - this._vsn) + this._vsn; //随机向量速度
            par.vx = sv * Math.cos(par.radian) + this._v0s * Math.cos(this._v0r);
            par.vy = sv * Math.sin(par.radian) + this._v0s * Math.sin(this._v0r);
            par.stime = Date.now();
            par.ay = Math.random() * (this._gsm - this._gsn) + this._gsn;
            par.ax = 0;
            par.vr = Math.random() * (this._rssm - this._rssn) + this._rssn;
            par.update();
            return par;
        }
        start(x, y) {
            if (!this.runner)
                this.runner = [];
            if (this.runner.length === 0) {
                k7.timer.frame(1, this.onFrame, this);
            }
            this.particle.center = { x, y };
            for (let i = 0; i < this.quantity; i += 1) {
                this.runner.push(this.particle.burst());
            }
        }
        onFrame() {
            if (!this.runner || this.runner.length === 0)
                k7.timer.clear(this.onFrame, this);
            let ct = Date.now();
            for (let i = this.runner.length - 1; i >= 0; i -= 1) {
                let sk = this.runner[i];
                let t = ct - sk.stime;
                sk.view.x = this.particle.center.x + sk.vx * t + sk.ax * t * t / 2;
                sk.view.y = this.particle.center.y + sk.vy * t + sk.ay * t * t / 2;
                sk.view.rotation += sk.vr;
                if (t > this._ast)
                    sk.view.alpha -= this._ass;
                if (sk.view.alpha <= 0) {
                    sk.view.removeFromParent();
                    this.runner.splice(0, 1);
                }
            }
        }
    }
    k7.FireworksRunner = FireworksRunner;
    class Spark {
        constructor(view) {
            this.view = view;
        }
        update() {
            this.view.scaleX = this.scaleX;
            this.view.scaleY = this.scaleY;
            this.view.rotation = this.rotation;
            this.view.alpha = this.alpha;
            this.view.x = this.x;
            this.view.y = this.y;
            this.view.visible = this.visible;
        }
    }
})(k7 || (k7 = {}));

(function (k7) {
    var followPool;
    /**
     * 拖尾跟随粒子，构造函数中，传入粒子所在的容器，
     * 一般情况下，建议在显示对象的下层，创建一个专用的空容器，
     * 与显示对象的父容器等宽等高。
     * 这样可以保证粒子始终在显示对象的下面，又能根据需要设置"叠加"效果
     */
    class FollowRunner {
        /**
         *
         * @param container 粒子所在容器(叠加在容器上设置)
         * @param imgUrl 粒子纹理
         * @param quantity 粒子数量，大于0的整数
        */
        constructor(container, quantity = 1, pool) {
            if (!pool && !followPool)
                followPool = {
                    cache: [],
                    urls: ['fv0']
                };
            this.particle = new k7.Particle(container, pool || followPool);
            this.quantity = quantity;
        }
        /** 设置要跟随的显示对象，对象必须包含x属性与y属性 */
        setFollow(target) {
            this.particle.center = target;
            return this;
        }
        /** 开始跟随出现粒子拖尾 */
        play(time) {
            this.particle.serial = true;
            this.particle.burst();
            if (time)
                k7.timer.delay(time, this.stop, this);
        }
        /** 停止粒子拖尾 */
        stop() {
            this.particle.serial = false;
        }
    }
    k7.FollowRunner = FollowRunner;
})(k7 || (k7 = {}));

(function (k7) {
    class Particle {
        /**
         * @param container 粒子所在容器(叠加的效果请自行在容器上设置)
         * @param imgUrl 粒子纹理
         */
        constructor(container, pool) {
            this._fsn = 0;
            this._fsm = Math.PI * 2;
            this._bsn = 1;
            this._bsm = 1;
            this._asn = 0.7;
            this._asm = 1;
            this._ssn = 1.6;
            this._ssm = 2;
            this._rsn = -180;
            this._rsm = 180;
            this._ben = 30;
            this._bem = 120;
            this._aen = 0;
            this._aem = 0;
            this._sen = 0;
            this._sem = 0;
            this._ren = 180;
            this._rem = 360;
            this._reWay = false;
            this._time = 900;
            /** 创建一个粒子的显示资源 */
            this.create = () => {
                let r = Math.floor(Math.random() * this.pool.urls.length);
                let u = this.pool.urls[r];
                return u.substr(0, 5) === 'ui://' ?
                    FUIPackage.createObjectFromURL(u) :
                    FUIPackage.createObject('basic_effect', u);
            };
            /** 重置一个粒子到初始显示状态 */
            this.reset = (par) => {
                par.radian = Math.random() * (this._fsm - this._fsn) + this._fsn; //随机一个飞行角度
                let sl = Math.random() * (this._bsm - this._bsn) + this._bsn; //随机产生起点
                par.x = this.center.x + sl * Math.cos(par.radian);
                par.y = this.center.y + sl * Math.sin(par.radian);
                if (this.is3D) {
                    par.radianZ = Math.random() * (this._fsm - this._fsn) + this._fsn;
                    let zl = par.x - this.center.x;
                    //TODO
                }
                par.alpha = Math.random() * (this._asm - this._asn) + this._asn; //随机初始透明度
                par.scaleX = par.scaleY = Math.random() * (this._ssm - this._ssn) + this._ssn; //随机初始大小
                par.rotation = this.lockRotation //随机初始自转角度
                    ? par.radian / (2 * Math.PI) * 360
                    : Math.random() * (this._rsm - this._rsn) + this._rsn;
                par.visible = true;
                return par;
            };
            /** 粒子爆开，在指定的时间，用quadout缓动，飞向target目标 */
            this.start = (par, target, time) => {
                k7.tween.to(par, target, time);
                k7.timer.delay(this._time, () => {
                    this.end(par);
                    this.dispose(par);
                });
            };
            this.end = (par) => {
                //NONE
            };
            this.container = container;
            this.pool = pool;
        }
        /**
         * 设置爆炸为一个扇形
         * @param axis 设置爆炸的扇形轴心向量角度
         * @param angle 设置爆炸的扇形的开合角度
         */
        setFanshaped(axis, angle) {
            //转弧度
            let axisR = (((axis + 360) % 360) - 90) / 180 * Math.PI;
            let angleR = ((angle + 360) % 360) / 180 * Math.PI;
            this._fsn = axisR - angleR / 2;
            this._fsm = axisR + angleR / 2;
            return this;
        }
        /** 在距离圆心min-max像素之间，随机爆出一颗粒子(默认1) */
        setBurst(min, max) {
            this._bsn = min;
            this._bsm = max || min;
            return this;
        }
        /** 在min-max之间，随机设置一颗粒子初始透明度(默认0.7~1) */
        setAlpha(min, max) {
            this._asn = min;
            this._asm = max || min;
            return this;
        }
        /** 在min-max之间，随机设置一颗粒子初始缩放比例(默认0.8~1) */
        setScale(min, max) {
            this._ssn = min;
            this._ssm = max || min;
            return this;
        }
        /** 在min-max之间，随机设置一颗粒子初始旋转角度(默认±180) */
        setRotation(min, max) {
            this._rsn = min;
            this._rsm = max || min;
            return this;
        }
        /** 在距离圆心min-max像素之间随机设置一颗粒子的终点 */
        setTargetBurst(min, max) {
            this._ben = min;
            this._bem = max || min;
            return this;
        }
        /** 在min-max之间，随机设置一颗粒子的目标透明度 */
        setTargetAlpha(min, max) {
            this._aen = min;
            this._aem = max || min;
            return this;
        }
        /** 在min-max之间，随机设置一颗粒子的目标缩放比例度 */
        setTargetScale(min, max) {
            this._sen = min;
            this._sem = max || min;
            return this;
        }
        /** 在min-max之间，随机设置一颗粒子目标旋转角度(基于初始值的增量)，way表示是否随机方向 */
        setTargetRotation(min, max, way = true) {
            this._ren = min;
            this._rem = max || min;
            this._reWay = way;
            return this;
        }
        /** 粒子缓动播放时间，默认900ms */
        setTime(time) {
            this._time = time;
            return this;
        }
        /** 设置粒子的中心点 */
        setXY(x, y) {
            if (!this.center) {
                this.center = { x, y };
            }
            else {
                this.center.x = x;
                this.center.y = y;
            }
            return this;
        }
        /** 设置是否持续爆出粒子 */
        setSerial(value) {
            this.serial = value;
            return this;
        }
        /** 设置方向锁定，锁定后粒子沿喷射方向飞行，无自转， */
        setLockRotation(value) {
            this.lockRotation = value;
            return this;
        }
        /** 在中心点爆出一颗粒子，播放，并消失 */
        burst(later = 1) {
            let par = this.build();
            if (par instanceof GObject) {
                this.container.addChild(par);
                par.setPivot(.5, .5, true);
            }
            else if (par.view) {
                this.container.addChild(par.view);
                par.view.setPivot(.5, .5, true);
            }
            let tl = Math.random() * (this._bem - this._ben) + this._ben;
            let alpha = Math.random() * (this._aem - this._aen) + this._aen;
            let scaleXY = Math.random() * (this._sem - this._sen) + this._sen;
            let tr = Math.random() * (this._rem - this._ren) + this._ren;
            let target = {
                x: this.center.x + tl * Math.cos(par.radian),
                y: this.center.y + tl * Math.sin(par.radian),
                alpha, scaleX: scaleXY, scaleY: scaleXY
            };
            if (!this.lockRotation) {
                target.rotation = par.rotation + tr * ((this._reWay && Math.random() < .5) ? -1 : 1);
            }
            this.start(par, target, this._time);
            if (this.serial)
                k7.timer.later(later, () => { this.burst(later); });
            return par;
        }
        /** 创建一颗粒子(回收机制) */
        build() {
            return this.reset(this.pool.cache.length > 0 ? this.pool.cache.pop() : this.create());
        }
        dispose(par) {
            if (par instanceof GObject) {
                par.removeFromParent();
            }
            if (par.view) {
                par.view.removeFromParent();
            }
            this.pool.cache.push(par);
        }
    }
    k7.Particle = Particle;
})(k7 || (k7 = {}));

(function (k7) {
    var squeezePool;
    class SqueezeRunner {
        /**
         *
         * @param container 粒子所在容器(叠加在容器上设置)
         * @param imgUrl 粒子纹理
         * @param quantity 粒子数量，大于0的整数
        */
        constructor(container, quantity = 1, pool) {
            if (!pool && !squeezePool)
                squeezePool = {
                    cache: [],
                    urls: ['c']
                };
            this.particle = new k7.Particle(container, pool || squeezePool);
            this.quantity = quantity;
            this.particle.start = (par, target, time) => {
                k7.tween.to(par, target, time);
            };
        }
        /**
         * 播放一个动画，从指定的坐标点，挤出一些道具。
         * 当全部显示对象创建时会回调onDisplayedAll函数，即便业务后续播放其他动画。
         * 所有挤出的粒子都存放在particleInst数组中，按需索取。
         * 由于挤出后，不是立即自动消失的，所以需要手动调用dispose回收显示对象。
         * @param x 挤出的中心坐标
         * @param y 挤出的中心坐标
         * @param length 挤出半径，默认50像素(±10)
         * @param time 单颗挤出的时间，默认350ms
         * @param delay 多颗直接挤出节奏间隔，默认50ms
         */
        start(x, y, length = 50, time = 350, delay = 50) {
            this.particleInst = [];
            this.particle
                .setBurst(1, 10)
                .setTargetBurst(length - 10, length + 10)
                .setAlpha(.3)
                .setTargetAlpha(1)
                .setScale(.5)
                .setTargetScale(1)
                .setTime(time)
                .center = { x, y };
            for (let i = 0; i < this.quantity; i += 1) {
                k7.timer.delay(delay * (i + 1), () => {
                    this.particleInst.push(this.particle.burst());
                    if (this.particleInst.length === this.quantity) {
                        this.onDisplayedAll && this.onDisplayedAll();
                    }
                }, this);
            }
            return this;
        }
        dispose(par) {
            if (par)
                this.particle.dispose(par);
            else
                for (let par of this.particleInst) {
                    this.particle.dispose(par);
                }
        }
    }
    k7.SqueezeRunner = SqueezeRunner;
})(k7 || (k7 = {}));

(function (k7) {
    class TweenTextField {
        constructor(tf, f = 0) {
            this.time = 500;
            this.textField = tf;
            this.fixed = f;
            this.process = { value: +tf.text };
        }
        update() {
            this.textField.text = this.process.value.toFixed(this.fixed);
        }
        tweenTo(value) {
            this.process.value = +this.textField.text;
            if (this.process.value === value)
                return;
            if (isNaN(this.process.value) || isNaN(value)) {
                this.textField.text = "" + value;
            }
            else {
                if (!this.tween) {
                    this.tween = k7.tween.to(this.process, { value }, this.time);
                }
                else {
                    this.tween.to({ value }, this.time).play();
                }
                k7.tween.update(this.tween.engineObject, this.update, this);
            }
        }
        set text(value) {
            this.tween && this.tween.stop();
            this.textField.text = value;
        }
        getXY(center) {
            return center
                ? {
                    x: this.textField.x + this.textField.width / 2,
                    y: this.textField.y + this.textField.height / 2
                }
                : { x: this.textField.x, y: this.textField.y };
        }
    }
    k7.TweenTextField = TweenTextField;
})(k7 || (k7 = {}));

(function (k7) {
    class GameEngine {
        constructor() {
            this.logicDelay = 10;
            this.autoStep = true;
            this._stack = [];
        }
        register(steper) {
            this._stack.push(steper);
        }
        remove() {
            if (this._running) {
                //TODO 不能直接移除，可能影响当前帧的运行
            }
            else {
                if (arguments.length == 0) {
                    while (this._stack.length > 0) {
                        this._stack.pop();
                    }
                }
                else {
                    for (let i = 0; i < arguments.length; i += 1) {
                        let steper = arguments[i];
                        let idx = this._stack.indexOf(steper);
                        if (idx !== -1) {
                            this._stack.splice(idx, 1);
                        }
                    }
                }
            }
        }
        get logicTime() { return this._logicTime; }
        get playing() { return this._playing; }
        get running() { return this._running; }
        start() {
            this._logicTime = 0;
            this._deffTime = 0;
            this._playing = true;
            this._running = true;
            this._frameTime = Date.now();
            for (let i = 0; i < this._stack.length; i += 1) {
                this._stack[i].start();
            }
            this._evtStackBefore = [];
            this._evtStackAfter = [];
            this._loopStackBefore = [];
            this._loopStackAfter = [];
            if (this.autoStep) {
                k7.timer.frame(1, this.step, this);
            }
            this._logicEfficiency = [];
            this._frameEfficiency = [];
        }
        pause() {
            this._playing = false;
            for (let i = 0; i < this._stack.length; i += 1) {
                this._stack[i].pause();
            }
        }
        resume() {
            this._playing = true;
            this._frameTime = Date.now();
            for (let i = 0; i < this._stack.length; i += 1) {
                this._stack[i].resume();
            }
        }
        stop() {
            this._playing = false;
            this._running = false;
            for (let i = 0; i < this._stack.length; i += 1) {
                this._stack[i].stop();
            }
            k7.timer.clear(this.step, this);
        }
        logicStep() {
            this._logicTime += this.logicDelay;
            let f = Date.now();
            this.loopStep(this._loopStackBefore);
            this.evtStep(this._evtStackBefore);
            for (let i = 0; i < this._stack.length; i += 1) {
                this._stack[i].logicStep();
            }
            this.evtStep(this._evtStackAfter);
            this.loopStep(this._loopStackAfter);
            this._logicEfficiency.push(Date.now() - f);
        }
        loopStep(stepStack) {
            let i = 0;
            while (i < stepStack.length) {
                let e = stepStack[i];
                if (e.tarTime <= this._logicTime) {
                    if (e.caller === undefined) {
                        e.evtFunc(e.delay, e.tarTime, e.regTime);
                    }
                    else {
                        e.evtFunc.call(e.caller, e.delay, e.tarTime, e.regTime);
                    }
                    e.tarTime += e.delay;
                }
                i += 1;
            }
        }
        evtStep(stepStack) {
            let i = 0;
            while (i < stepStack.length) {
                let e = stepStack[i];
                if (e.tarTime <= this._logicTime) {
                    stepStack.splice(i, 1);
                    if (e.caller === undefined) {
                        e.evtFunc(e.delay, e.tarTime, e.regTime);
                    }
                    else {
                        e.evtFunc.call(e.caller, e.delay, e.tarTime, e.regTime);
                    }
                    continue;
                }
                i += 1;
            }
        }
        frameStep() {
            for (let i = 0; i < this._stack.length; i += 1) {
                this._stack[i].frameStep();
            }
        }
        step() {
            if (!this._playing)
                return;
            var f = Date.now();
            this._frameEfficiency.push(f - this._frameTime);
            this._deffTime += f - this._frameTime;
            this._frameTime = f;
            while (this._deffTime > this.logicDelay) {
                this._deffTime -= this.logicDelay;
                this.logicStep();
            }
            this.frameStep();
        }
        /**
         *  延迟执行
         * @param time 延迟时间(是距离当前逻辑时间的相对时间，逻辑毫秒)
         * @param evtFunc 回调函数
         * @param caller 回调域
         * @param after 事件触发在逻辑之前或之后
         */
        delay(time, evtFunc, caller, cover = true, after) {
            let stack = after ? this._evtStackAfter : this._evtStackBefore;
            let idx = this.indexOf(stack, evtFunc, caller);
            if (idx === -1)
                stack.push({
                    regTime: this._logicTime,
                    delay: time,
                    tarTime: this._logicTime + time,
                    evtFunc, caller, after
                });
            else if (cover) {
                let e = stack[idx];
                e.regTime = this._logicTime;
                e.delay = time;
                e.tarTime = this._logicTime + time;
                e.after = after;
            }
        }
        clearDelay(evtFunc, caller, after) {
            let stack = after ? this._evtStackAfter : this._evtStackBefore;
            let index = this.indexOf(stack, evtFunc, caller);
            if (index !== -1)
                stack.splice(index, 1);
        }
        clearAllDelay() {
            this._evtStackAfter = [];
            this._evtStackBefore = [];
        }
        /**
         *  循环执行
         * @param time 循环时间(使用逻辑时间进行帧循环执行，逻辑毫秒)
         * @param evtFunc
         * @param caller
         * @param after
         */
        loop(time, evtFunc, caller, cover = true, after) {
            let stack = after ? this._loopStackAfter : this._loopStackBefore;
            let idx = this.indexOf(stack, evtFunc, caller);
            if (idx === -1)
                stack.push({
                    regTime: this._logicTime,
                    delay: time,
                    tarTime: this._logicTime + time,
                    evtFunc, caller, after
                });
            else if (cover) {
                let e = stack[idx];
                e.regTime = this._logicTime;
                e.delay = time;
                e.tarTime = this._logicTime + time;
                e.after = after;
            }
        }
        clearLoop(evtFunc, caller, after) {
            let stack = after ? this._loopStackAfter : this._loopStackBefore;
            let index = this.indexOf(stack, evtFunc, caller);
            if (index !== -1)
                stack.splice(index, 1);
        }
        clearAllLoop() {
            this._loopStackAfter = [];
            this._loopStackBefore = [];
        }
        tween(target, props, duration, ease) {
            //TODO
        }
        clearTween() {
            //TODO
        }
        indexOf(stack, evtFunc, caller) {
            let i = stack.length;
            while ((i -= 1) > -1) {
                let e = stack[i];
                if (e.evtFunc === evtFunc && e.caller === caller) {
                    break;
                }
            }
            return i;
        }
    }
    k7.GameEngine = GameEngine;
    k7.game = new GameEngine;
})(k7 || (k7 = {}));

(function (k7) {
    const game_tween_pool = [];
    /**
     * 在游戏中缓动类，可用于游戏中的特效或没应用在没有关联逻辑的弹道描述等。
     * 该动画会随着游戏时间控制器，一同加速结束或暂停，也可用于联机帧同步。
     * 若在缓动结束后进行逻辑判断，有可能(不确定性的)会出现1帧的误差。
     */
    class GameTween {
        constructor(mainSteper) {
            this._mainSteper = mainSteper;
        }
        /** 执行后，立即开始计算，下一帧开始计算位移 */
        static to(target, props, duration, ease = null, delay = 0, complete = null) {
            return game_tween_pool.length > 0
                ? game_tween_pool.pop()._create(target, props, duration, ease, delay, complete)
                : new GameTween(null)._create(target, props, duration, ease, delay, complete);
        }
        /** 需手动调用play才会记录当前时间，下一帧开始位移 */
        static get(target) {
            return game_tween_pool.length > 0
                ? game_tween_pool.pop()._get(target)
                : new GameTween(null)._get(target);
        }
        _create(target, props, duration, ease, delay, complete) {
            this._get(target);
            this._asyncStack.push({ props, duration, delay, ease, complete });
            this.nextPlay();
            return this;
        }
        _get(target) {
            this._asyncIndex = 0;
            this._asyncStack = [];
            this._target = target;
            return this;
        }
        /**
         * 播放缓动
         * @param overtime 若当前时间已超过了预定的起始时间，则传递overtime来校正
         */
        nextPlay(overtime = 0) {
            let action = this._asyncStack[this._asyncStack.length - 1];
            this._duration = action.duration;
            this._ease = action.ease || action.props.ease || k7.easeNone;
            this._complete = action.complete || action.props.complete;
            this._delay = action.delay;
            this._props = [];
            this._usedTimer = 0;
            this._initProps(this._target, action.props);
            this._startTimer = this._mainSteper.logicTime - overtime;
            if (this._delay - overtime <= 0) {
                this.play();
            }
            else {
                this._startTimer += action.delay;
                this._mainSteper.delay(action.delay - overtime, this.play, this);
            }
        }
        _initProps(target, props) {
            this._props = [];
            for (var p in props) {
                if (typeof (target[p]) == 'number') {
                    let start = target[p];
                    let end = props[p];
                    this._props.push([p, start, end - start]);
                }
            }
        }
        step() {
            if (!this._target)
                return;
            this._usedTimer = this._mainSteper.logicTime - this._startTimer;
            if (this._usedTimer < 0)
                return;
            if (this._usedTimer >= this._duration)
                return this.complete();
            let n = this._props.length;
            if (n == 1)
                this._target[this._props[0][0]] = this._ease(this._usedTimer, this._props[0][1], this._props[0][2], this._duration);
            else {
                var ratio = this._ease(this._usedTimer, 0, 1, this._duration);
                var props = this._props;
                for (let i = 0; i < n; i += 1) {
                    let prop = props[i];
                    this._target[prop[0]] = prop[1] + (ratio * prop[2]);
                }
            }
        }
        complete() {
            if (!this._target)
                return;
            var props = this._props;
            for (var i = 0, n = props.length; i < n; i += 1) {
                let prop = props[i];
                this._target[prop[0]] = prop[1] + prop[2];
            }
            this._complete || this._complete();
            if (this._asyncIndex + 1 < this._asyncStack.length) {
                this._asyncIndex += 1;
                this.nextPlay(this._usedTimer - this._duration);
            }
            else {
                this.clear();
            }
        }
        /**
         * 清理并回收动画属性控制器，
         * 被控制的逻辑属性会立即停止不再更新，
         * 预制未执行的回调也不再触发
         */
        clear() {
            this._complete = null;
            this._target = null;
            this._ease = null;
            this._props = null;
            this._asyncStack = null;
            game_tween_pool.push(this);
            this._mainSteper.remove(this);
        }
        //====================================引擎部分====================================
        start() {
            //NONE
        }
        logicStep() {
            //NONE
        }
        frameStep() {
            this.step();
        }
        pause() {
            //NONE
        }
        resume() {
            //NONE
        }
        stop() {
            this.clear();
        }
        play() {
            this._mainSteper.register(this);
            return this;
        }
        to(props, duration, ease) {
            let action = this._asyncStack.length > 0
                ? this._asyncStack[this._asyncStack.length - 1]
                : null;
            if (action && action.props === undefined && action.duration === undefined) {
                action.props = props;
                action.duration = duration;
                action.ease = ease;
            }
            else {
                this._asyncStack.push({ props, duration, ease });
            }
            return this;
        }
        from(props, duration, ease) {
            //TODO
            return this;
        }
        wait(duration) {
            this._asyncStack.push({ delay: duration });
            return this;
        }
        call(callback) {
            let action = this._asyncStack[this._asyncStack.length - 1];
            if (action.complete === undefined) {
                action.complete = callback;
            }
            else {
                this._asyncStack.push({ complete: callback });
            }
            return this;
        }
        set(props) {
            this._asyncStack.push({ duration: 0, props });
            return this;
        }
    }
    k7.GameTween = GameTween;
})(k7 || (k7 = {}));

(function (k7) {
    var instHistory = [];
    function getFairyInstence(type, ...args) {
        let inst = searchFairyInstence(type);
        if (inst)
            return inst;
        inst = new type(...args);
        instHistory.push({ type, inst });
        return inst;
    }
    k7.getFairyInstence = getFairyInstence;
    function searchFairyInstence(type) {
        for (let i = 0; i < instHistory.length; ++i) {
            let item = instHistory[i];
            if (item.type == type)
                return item.inst;
        }
        return null;
    }
    k7.searchFairyInstence = searchFairyInstence;
    const _itemInfoDict = [];
    function registerListItem(list, type, owner) {
        for (let i = 0; i < _itemInfoDict.length; i += 1) {
            if (_itemInfoDict[i].list === list) {
                console.warn('list item was registered.');
                return;
            }
        }
        _itemInfoDict.push({ list, type, owner });
    }
    k7.registerListItem = registerListItem;
    const _itemDict = [];
    function getListItem(view) {
        for (let i = 0; i < _itemDict.length; i += 1) {
            if (_itemDict[i].getView() === view) {
                return _itemDict[i];
            }
        }
        let list = view.parent;
        for (let i = 0; i < _itemInfoDict.length; i += 1) {
            let info = _itemInfoDict[i];
            if (info.list === list) {
                let item = new info.type(view, info.owner);
                _itemDict.push(item);
                return item;
            }
        }
        let item = new k7.FairyListItem(view);
        _itemDict.push(item);
        return item;
    }
    k7.getListItem = getListItem;
})(k7 || (k7 = {}));





(function (k7) {
    class AppWindow extends GWindow {
        /** 导出的组件名，组件所在的包，指定加载的(如果纹理需要独立加载的情况) */
        constructor(name, pack, ...sources) {
            super();
            this.transShowName = 'show';
            this.transHideName = 'hide';
            /** 绑定在此窗口下的子窗口列表 */
            this.subWindowsList = {};
            this._uiMediators = [];
            this.focusBackup = [];
            this._eventList = [];
            this.name = name;
            this.pack = pack;
            this.path = k7.addPrefix(k7.fairyUrlRemotePrefix, k7.addPrefix(k7.fairyUrlLocalPrefix, this.pack));
            for (let i = 2; i < arguments.length; ++i) {
                let source = arguments[i];
                this.addUISource(source);
            }
            this.modal = true;
            this.isCenter = true;
            this.initConfig();
            k7.engine.onAddedToStage(this.displayObject, this.onAddedToStage);
            k7.engine.onRemovedFromStage(this.displayObject, this.onRemovedFromStage);
        }
        static show(type) {
            let win = k7.getFairyInstence(type);
            win.show();
            return win;
        }
        static showByParam(type, param) {
            let win = k7.getFairyInstence(type);
            win.showByParams(param);
            return win;
        }
        onAddedToStage() {
            mvc.send(k7.EVT_STAGE_ADDED, this);
        }
        onRemovedFromStage() {
            mvc.send(k7.EVT_STAGE_REMOVED, this);
        }
        initConfig() {
        }
        getUISources() {
            return this['_uiSources'].slice();
        }
        show() {
            if (this.isPopup) {
                GRoot.inst.showPopup(this);
                this.onResize();
            }
            else if (this.parent == GRoot.inst) {
                this.refreshUi();
                this.onShowAniComplete();
            }
            else {
                super.show();
            }
        }
        showByParams(param) {
            this.openData = param;
            this.show();
            return this;
        }
        hide() {
            this.openData = undefined;
            this.closeAllSubWindow();
            super.hide();
            this.refreshOwnerWindow();
            this.clearAlwaysTop();
        }
        hideThen(next, nextObj) {
            this.hideThenCall = next;
            this.hideThenObj = nextObj;
            this.hide();
        }
        init() {
            super.init();
            if (this['_loading'] && AppWindow.configLoadingWaiting) {
                this.showLoadingWait();
            }
        }
        showLoadingWait() {
            if (!this.loadingWaitPane)
                this.loadingWaitPane = FUIPackage.createObjectFromURL(AppWindow.configLoadingWaiting);
            this.layoutLoadingWaitPane();
            GRoot.inst.addChild(this.loadingWaitPane);
        }
        layoutLoadingWaitPane() {
            this.loadingWaitPane.makeFullScreen();
        }
        closeLoadingWait() {
            if (this.loadingWaitPane && this.loadingWaitPane.parent != null)
                this.loadingWaitPane.removeFromParent();
        }
        onInit() {
            this.closeLoadingWait();
            if (this.contentPane == null) {
                if (this.pack && !FUIPackage.getByName(this.pack)) {
                    FUIPackage.addPackage(this.path);
                }
                this.contentPane = FUIPackage.createObject(this.pack, this.name).asCom;
            }
            this._adapter = new k7.FairyMediator(this.contentPane, this, k7.addPrefix(this.path, this.name));
            this.createArea();
            this.bindChild();
        }
        createArea() { }
        doShowAnimation() {
            this.onResize();
            this.refreshUi();
            this.registerMediators();
            this.touchable = false;
            if (this.showAnimation) {
                this.showAnimation(this, this.onShowAniComplete);
            }
            else {
                k7.fairy.playTransition(this, this.transShowName, this.onShowAniComplete, this) || this.onShowAniComplete();
            }
        }
        doHideAnimation() {
            this.removeMediators();
            this.touchable = false;
            if (this.hideAnimation) {
                this.hideAnimation(this, this.onHideAniComplete);
            }
            else {
                k7.fairy.playTransition(this, this.transHideName, this.onHideAniComplete, this) || this.onHideAniComplete();
            }
        }
        onShowAniComplete() {
            this.touchable = true;
            mvc.send(k7.EVT_FAIRY_READY, this);
            this.onShown();
        }
        onHideAniComplete() {
            this.touchable = true;
            this.hideImmediately();
            if (this.hideThenCall) {
                this.hideThenCall.call(this.hideThenObj);
                this.hideThenCall = null;
                this.hideThenObj = null;
            }
        }
        onResize() {
            if (this.isFullScreen)
                this.makeFullScreen();
            else if (this.isCenter)
                this.center();
        }
        dispose() {
            super.dispose();
            this.removeMediators();
            this.clearAlwaysTop();
        }
        bindChild() { }
        refreshUi() { }
        /** 注册一个子窗口，随后可以用字符串打开该窗口，并绑定了子窗口该子窗口，详见bindSubWindow */
        registerSubWindow(WinClass, name, pack, tex) {
            if (this.subWindowsList[name] == null) {
                if (!pack)
                    pack = this.pack;
                this.bindSubWindow(new WinClass(name, pack, tex));
            }
            return this.subWindowsList[name];
        }
        /** 绑定一个窗口实例为当前窗口的子窗口，启动关闭将会有冒泡联动通知（比如：用于刷新） */
        bindSubWindow(win) {
            if (this.subWindowsList[win.name] == null) {
                win.ownerWindow = this;
                this.subWindowsList[win.name] = win;
            }
            return this.subWindowsList[win.name];
        }
        /** 打开一个子窗口 */
        showSubWindow(name, openData) {
            let win = this.subWindowsList[name];
            if (win == null)
                return;
            if (openData || openData === null)
                win.openData = openData;
            win.show();
            return win;
        }
        /** 关闭所有子窗口 */
        closeAllSubWindow() {
            for (var name in this.subWindowsList) {
                this.subWindowsList[name].hide();
            }
        }
        /** 刷新父窗口界面(使用场景举例：子界面某操作更新大厅数据) */
        refreshOwnerWindow() {
            this.ownerWindow && this.ownerWindow.onCloseSubWindow(this);
        }
        registerMediators() {
            mvc.registerMediator(this);
            for (let i = 0; i < this._uiMediators.length; ++i) {
                mvc.registerMediator(this._uiMediators[i]);
            }
        }
        removeMediators() {
            mvc.removeMediator(this.mediatorName);
            for (let i = 0; i < this._uiMediators.length; ++i) {
                mvc.removeMediator(this._uiMediators[i].mediatorName);
            }
        }
        /** 实时注册Mediator，会在关闭时自动卸载，下次显示自动生效（本次立即生效） */
        addMediator(mediator) {
            if (this._uiMediators.indexOf(mediator) === -1) {
                this._uiMediators.push(mediator);
                mvc.registerMediator(mediator);
            }
        }
        setFocus() {
            let parent = this.contentPane;
            if (this.modalLayer == null) {
                this.modalLayer = this.getGraph('modalLayer');
            }
            if (!this.modalLayer) {
                this.modalLayer = new GGraph();
                this.modalLayer.makeFullScreen();
                this.modalLayer.drawRect(0, "#000000", "#000000");
                parent.addChild(this.modalLayer);
                let { x, y } = parent.localToGlobal();
                this.modalLayer.setXY(-x, -y);
            }
            if (this.modalLayer) {
                this.modalLayer.alpha = 0;
                this.modalLayer.visible = true;
                k7.tween.to(this.modalLayer, { alpha: 0.65 }, 250);
            }
            let info = [];
            for (let i = 0; i < arguments.length; ++i) {
                let child = arguments[i];
                if (typeof child === 'string') {
                    child = parent.getChild(child);
                }
                else if (child instanceof k7.FairyChild) {
                    child = child.getView();
                }
                info[i] = { child, index: child.parent.getChildIndex(child) };
                if (child.parent != parent) {
                    info[i].parent = child.parent;
                    info[i].x = child.x;
                    info[i].y = child.y;
                    var { x, y } = child.localToGlobal();
                    let childX = x, childY = y;
                    var { x, y } = parent.localToGlobal();
                    let parentX = x, parentY = y;
                    parent.addChild(child);
                    child.x = childX - parentX;
                    child.y = childY - parentY;
                }
            }
            let res = [];
            while (info.length > 0) {
                let min = info[0];
                for (let i = 1; i < info.length; ++i) {
                    let obj = info[i];
                    if (obj.index < min.index) {
                        min = obj;
                    }
                }
                res.push(...info.splice(info.indexOf(min), 1));
            }
            if (this.modalLayer) {
                parent.setChildIndex(this.modalLayer, parent.numChildren);
            }
            for (let i = 0; i < res.length; ++i) {
                let obj = res[i];
                parent.setChildIndex(obj.child, parent.numChildren);
            }
            this.focusBackup = res;
        }
        resumeFocus() {
            if (this.modalLayer) {
                this.modalLayer.visible = false;
            }
            for (let i = 0; i < this.focusBackup.length; ++i) {
                let obj = this.focusBackup[i];
                if (obj.parent) {
                    obj.parent.addChildAt(obj.child, obj.index);
                    obj.child.x = obj.x;
                    obj.child.y = obj.y;
                }
                else if (obj.child.parent == this.contentPane) {
                    this.contentPane.setChildIndex(obj.child, obj.index);
                }
            }
        }
        /** 弹出新界面时，或转换到新场景时，当前界面会始终保持在最前面 */
        setAlwaysTop() {
            mvc.on(k7.EVT_STAGE_ADDED, this, this.bringToFront);
        }
        clearAlwaysTop() {
            mvc.off(k7.EVT_STAGE_ADDED, this, this.bringToFront);
        }
        //IFairyChildOnwer
        onClickButton(button) { }
        onCloseSubWindow(window) { }
        onClickItem(item) { }
        onListRenderer(item, index) { }
        setRoot(view) { this._adapter.setRoot(view); }
        getComp(path) { return this._adapter.getComp(path); }
        getLabel(path) { return this._adapter.getLabel(path); }
        getProgressBar(path) { return this._adapter.getProgressBar(path); }
        getTextField(path) { return this._adapter.getTextField(path); }
        getRichTextField(path) { return this._adapter.getRichTextField(path); }
        getTextInput(path) { return this._adapter.getTextInput(path); }
        getLoader(path) { return this._adapter.getLoader(path); }
        getGraph(path) { return this._adapter.getGraph(path); }
        getGroup(path) { return this._adapter.getGroup(path); }
        getSlider(path) { return this._adapter.getSlider(path); }
        getComboBox(path) { return this._adapter.getComboBox(path); }
        getImage(path) { return this._adapter.getImage(path); }
        getMovieClip(path) { return this._adapter.getMovieClip(path); }
        getController(path) { return this._adapter.getController(path); }
        getTransition(path) { return this._adapter.getTransition(path); }
        getButton(path, clickListener, parent) {
            return this._adapter.getButton(path, clickListener, parent);
        }
        getSubWindow(path, closeListener, parent) {
            return this._adapter.getSubWindow(path, closeListener, parent);
        }
        getFairy(path, type = k7.FairyChild) {
            return this._adapter.getFairy(path, type);
        }
        getList(path, type = k7.FairyListItem) {
            return this._adapter.getList(path, type);
        }
        //mvc.IMediator
        get mediatorName() { return this._adapter.mediatorName; }
        get viewComponent() { return this; }
        get eventList() { return this._eventList; }
        set eventList(value) { this._eventList = value; }
        onEvent(eventName, params) { }
        onRegister() { this._adapter.onRegister(); }
        onRemove() { this._adapter.onRemove(); }
    }
    k7.AppWindow = AppWindow;
})(k7 || (k7 = {}));





(function (k7) {
    class AppScene extends k7.AppWindow {
        static show(type) {
            let scene = k7.getFairyInstence(type);
            scene.show();
            return scene;
        }
        static showByParam(type, param) {
            let scene = k7.getFairyInstence(type);
            scene.showByParams(param);
            return scene;
        }
        static transTo(type, params, transComp) {
            if (!transComp)
                transComp = k7.getFairyInstence(AppScene.TransComp);
            transComp.showAndTo(type, params);
        }
        initConfig() {
            this.modal = false;
            this.isCenter = false;
            this.isFullScreen = true;
            this.bringToFontOnClick = false;
        }
        createArea() {
            this.topArea = this.contentPane.getChild("topArea");
            this.bottomArea = this.contentPane.getChild("bottomArea");
            this.leftArea = this.contentPane.getChild("leftArea");
            this.rightArea = this.contentPane.getChild("rightArea");
            this.centerArea = this.contentPane.getChild("centerArea");
        }
        /** 场景显示，若已有场景，会自带切换功能(旧版逻辑在代码尾部，若遇到问题可参考) */
        show() {
            if (AppScene.current == null) {
                AppScene.current = this;
                super.show();
                mvc.on(k7.EVT_STAGE_RESIZE, this, this.onResize);
            }
            else if (AppScene.current == this) {
                super.show();
            }
            else {
                let scene = AppScene.current;
                AppScene.current = null;
                scene.hideThen(this.show, this);
            }
        }
        onHide() {
            mvc.off(k7.EVT_STAGE_RESIZE, this, this.onResize);
        }
    }
    AppScene.current = null;
    k7.AppScene = AppScene;
})(k7 || (k7 = {}));

(function (k7) {
    class BackGround extends k7.FairyChild {
        bindChild() {
            this._iconObject = this.getLoader('icon');
            this._previewObject = this.getLoader('preview');
            this._trans = this.getTransition('show');
            return this;
        }
        set preview(value) {
            this._previewObject.url = value;
        }
        set icon(value) {
            this._iconObject.url = value;
        }
        load(url) {
            if (this._url === url)
                return;
            if (this._loading)
                return;
            //内部资源
            if (url.indexOf('ui://') === 0) {
                this._iconObject.url = url;
                this._url = url;
                this._trans.play();
            }
            //网络资源
            else {
                this._loading = true;
                k7.loader.loadRes(url, 'image', res => {
                    this._loading = false;
                    if (!res)
                        return;
                    this._url = url;
                    this._iconObject['__getResCompleted'](res);
                    this._trans.play();
                });
            }
        }
    }
    k7.BackGround = BackGround;
})(k7 || (k7 = {}));

(function (k7) {
    class FairyMediator extends k7.FairyChild {
        constructor(viewComponent, owner, name) {
            super(viewComponent, owner);
            this._eventList = [];
            this.mediatorAdapter.setMediatorName(name);
        }
        setView(view) {
            super.setView(view);
            if (this.mediatorAdapter) {
                this.mediatorAdapter.viewComponent = view;
            }
            else {
                this.mediatorAdapter = new k7.MediatorUiAdapter('', this);
            }
            return this;
        }
        get mediatorName() { return this.mediatorAdapter.mediatorName; }
        get eventList() { return this._eventList; }
        set eventList(value) { this._eventList = value; }
        onEvent(eventName, params) { }
        onRegister() {
            for (let key in this._childDict) {
                let fm = this._childDict[key];
                if (fm instanceof FairyMediator) {
                    mvc.registerMediator(fm);
                }
            }
        }
        onRemove() {
            for (let key in this._childDict) {
                let fm = this._childDict[key];
                if (fm instanceof FairyMediator) {
                    mvc.removeMediator(fm.mediatorName);
                }
            }
        }
    }
    k7.FairyMediator = FairyMediator;
})(k7 || (k7 = {}));



(function (k7) {
    class FairyListItem extends k7.FairyMediator {
        /** 当list内组件发生渲染变更时回调该函数 */
        onRenderer(index) { }
        /** 当list内发生点击事件时回调 */
        onClick() { }
    }
    k7.FairyListItem = FairyListItem;
})(k7 || (k7 = {}));

(function (k7) {
    //由于多继承，且被多个类包含使用，所以该类使用适配器模式进行多继承匹配，目的在于方便统一修改维护
    class MediatorUiAdapter extends mvc.Mediator {
        constructor(name, view) {
            super('', view);
            this.subMediators = [];
            this.setMediatorName(name);
            this.owner = view;
        }
        setMediatorName(name) {
            this.mediatorName = 'mediator://' + name;
        }
        onShow() {
            mvc.registerMediator(this);
            for (let i = 0; i < this.subMediators.length; ++i) {
                mvc.registerMediator(this.subMediators[i]);
            }
        }
        onReady() {
            mvc.send(k7.EVT_FAIRY_READY, this.owner);
        }
        onHide() {
            mvc.removeMediator(this.mediatorName);
            for (let i = 0; i < this.subMediators.length; ++i) {
                mvc.removeMediator(this.subMediators[i].mediatorName);
            }
        }
        bindMediator(...args) {
            this.subMediators.push(...args);
        }
        onRegister() {
            this.owner && this.owner.onRegister && this.owner.onRegister();
        }
        get eventList() {
            return this.owner ? this.owner.eventList || [] : [];
        }
        onEvent(eventName, params) {
            this.owner && this.owner.onEvent && this.owner.onEvent(eventName, params);
        }
        onRemove() {
            this.owner && this.owner.onRemove && this.owner.onRemove();
        }
    }
    k7.MediatorUiAdapter = MediatorUiAdapter;
})(k7 || (k7 = {}));

(function (k7) {
    class TransComp extends k7.AppWindow {
        constructor() {
            super(...arguments);
            /** 事件列表 */
            this._eventList = [k7.EVT_FAIRY_READY, k7.EVT_SourceLoader_Complete];
        }
        get eventList() {
            return this._eventList;
        }
        set eventList(value) {
            this._eventList = value;
        }
        /** 显示转场动画，并跳转到目标场景 */
        showAndTo(targetSceneType, params) {
            this.openData = params;
            this.targetSceneType = targetSceneType;
            this.targetScene = k7.getFairyInstence(targetSceneType);
            this.show();
        }
        /** 打开下一个界面，当下一个界面的准备好时，会自动调用hide并播放转场动画中的离场动画 */
        onShown() {
            k7.AppScene.showByParam(this.targetSceneType, this.openData);
            //this.bringToFront(); //TODO 这个要研判一下 是否要执行或结构是否有问题
        }
        onEvent(eventName, params) {
            if (eventName == k7.EVT_FAIRY_READY && params === this.targetScene) {
                this.hide();
            }
        }
    }
    k7.TransComp = TransComp;
})(k7 || (k7 = {}));

(function (k7) {
    let EAlertType;
    (function (EAlertType) {
        /** 显示两个按钮 */
        EAlertType[EAlertType["DOUBLE"] = 0] = "DOUBLE";
        /** 只显示左边的 */
        EAlertType[EAlertType["LEFT"] = 1] = "LEFT";
        /** 只显示右边的 */
        EAlertType[EAlertType["RIGHT"] = 2] = "RIGHT";
        /** 左右按钮颜色交换[TODO] */
        EAlertType[EAlertType["SWAP"] = 3] = "SWAP";
        /** 什么按钮都没有 */
        EAlertType[EAlertType["NONE"] = 4] = "NONE";
    })(EAlertType = k7.EAlertType || (k7.EAlertType = {}));
    /**
     *  Alert弹窗，具体界面由fairygui完成，需要遵循以下规则，即可快速完成一个Alert弹窗的制作
     * 1、必须放置一个命名为frame的组件，且里面有一个top控制器，控制closeButton是否显示，0不显示，1显示
     * 2、必须有两个按钮和一个文本框，且按钮需命名为leftButton,rightButton,文本框需命名为contentTextFiled
     * 3、使用方法为继承使用，列子如下
        export class AlertWindow extends kqframe.AlertWindow {
            static inst: AlertWindow;
            static show(content: string, param: kqframe.IAlertParam = {}): AlertWindow {
                if (AlertWindow.inst == null) {
                    AlertWindow.inst = new AlertWindow('Alert', 'Gobang');
                }
                AlertWindow.inst.setAndShow(content,param);
                return AlertWindow.inst;
            }
        }
        //也可以直接创建一个全局函数，简化API，例子如下：
        function appAlert(content: string, param: kqframe.IAlertParam = {}) {
            if (null == kqframe.AlertWindow.inst) {
                kqframe.AlertWindow.inst = new kqframe.AlertWindow('Alert', 'Gobang');
            }
            return kqframe.AlertWindow.inst.setAndShow(content, param);
        }
     * 4、如果要默认配置一种类型的文本，可直接在fgui的ide里写死，若需要配置不同的名称，可继承AlertWindow扩展refurbish函数，如下：
        refurbish(){
            super.refurbish();
            this.leftButton.title = this.param.textL || (this.param.type == EAlertType.SWAP ? "取消" : "同意");
            this.rightButton.title = this.param.textR || (this.param.type == EAlertType.DOUBLE ? "拒绝" : "确定");
        }
     * 5、可使用import appAlert = AlertWindow.show 的方式，缩短访问路径
     */
    class AlertWindow extends k7.AppWindow {
        bindChild() {
            this.stateCtrl = this.getController('state');
            this.topCtrl = this.getController('frame.top');
            this.leftButton = this.getButton("leftButton");
            this.rightButton = this.getButton("rightButton");
            this.contentTextFiled = this.getTextField("contentTextFiled");
        }
        set(content, param = {}) {
            this.contentString = content;
            this.param = param;
            return this;
        }
        refreshUi() {
            if (this.topCtrl)
                this.topCtrl.selectedIndex = this.param.noClose ? 1 : 0;
            if (this.param.type !== 1 && this.param.type !== 2 && this.param.type !== 3)
                this.param.type = 0;
            this.stateCtrl.selectedIndex = this.param.type;
            this.contentTextFiled.text = this.contentString;
            if (this.param.title)
                this.frame.icon = this.param.title;
            if (this.param.textL)
                this.leftButton.title = this.param.textL;
            if (this.param.textR)
                this.rightButton.title = this.param.textR;
        }
        onClickButton(button) {
            switch (button) {
                case this.leftButton:
                    this.param.type == EAlertType.SWAP ? this.onClickRight() : this.onClickLeft();
                    break;
                case this.rightButton:
                    this.param.type == EAlertType.SWAP ? this.onClickLeft() : this.onClickRight();
                    break;
            }
        }
        onClickLeft() {
            if (!this.param.stayL)
                this.hide();
            if (typeof this.param.subL == "function") {
                this.param.subL.call(this.param.objL || this.param.thisObj || this);
            }
        }
        onClickRight() {
            if (!this.param.stayL)
                this.hide();
            if (typeof this.param.subR == "function") {
                this.param.subR.call(this.param.objR || this.param.thisObj || this);
            }
        }
        hide() {
            super.hide();
            if (typeof this.param.onClose == "function") {
                this.param.onClose.call(this.param.objCLose || this.param.thisObj || this);
            }
        }
    }
    k7.AlertWindow = AlertWindow;
})(k7 || (k7 = {}));

(function (k7) {
    class SheetWindow extends k7.AppWindow {
        bindChild() {
            this.list = this.getList('list');
            k7.fairy.setItemRenderer(this.list, this.itemRenderer, this);
            k7.fairy.setItemClick(this.list, this.itemClick, this);
        }
        set(labels, clickCallback) {
            this.labels = labels.concat('取消');
            this.clickCallback = clickCallback;
        }
        refreshUi() {
            this.list.numItems = this.labels.length;
        }
        doShowAnimation() {
            super.doShowAnimation();
            this.y = GRoot.inst.height;
            k7.tween.to(this, { y: GRoot.inst.height - this.height }, 350);
        }
        itemRenderer(index, gObj) {
            gObj.title = this.labels[index];
        }
        itemClick(gObj) {
            let index = this.list.getChildIndex(gObj);
            if (index == this.labels.length - 1) {
                this.hide();
            }
            else {
                this.clickCallback && this.clickCallback(index);
            }
        }
    }
    k7.SheetWindow = SheetWindow;
})(k7 || (k7 = {}));

(function (k7) {
    class TipWindow extends k7.AppWindow {
        constructor() {
            super(...arguments);
            this.showTime = 350;
            this.hideTime = 200;
        }
        bindChild() {
            this.contentTextFiled = this.getTextField("contentTextFiled");
            this.alpha = 0;
        }
        set(content, param) {
            this.contentString = content;
            this.param = param;
            this.modal = param.modal;
            this.center();
            return this;
        }
        refreshUi() {
            //ICON TODO
            this.contentTextFiled.text = this.contentString;
            this.iconLoader.url = this.param.icon;
            if (this.hideTween) {
                this.hideTween.stop();
                this.hideTween = null;
            }
            if (!isNaN(this.autoTimerId)) {
                clearTimeout(this.autoTimerId);
                this.autoTimerId = undefined;
            }
            if (this.param.duration > 0) {
                this.autoHide();
            }
        }
        doShowAnimation() {
            super.doShowAnimation();
            //TODO API ADAPTER
            // tween.to(this, { alpha: 1 }, this.showTime, EaseName.QuadOut, this, this.onShowAniComplete);
        }
        doHideAnimation() {
            super.doHideAnimation();
            //TODO API ADAPTER
            // this.hideTween = tween.to(this, { alpha: 0 }, this.hideTime, EaseName.QuadOut, this, this.onHideAniComplete);
        }
        autoHide() {
            if (this.autoTimerId === undefined) {
                this.autoTimerId = setTimeout(() => {
                    this.autoTimerId = undefined;
                    this.hide();
                }, this.param.duration);
            }
        }
        hideImmediately() {
            this.hideTween = null;
            super.hideImmediately();
        }
    }
    k7.TipWindow = TipWindow;
})(k7 || (k7 = {}));

(function (k7) {
    /** 单个loader文件加载结果发布(可能成功或失败，详见ASourceLoader属性)，事件唯一参数类型：ASourceLoader */
    k7.EVT_SourceLoader_Complete = 'EVT_SourceLoader_Complete';
    class ASourceLoader {
        constructor() {
            this.callbacks = [];
            this.thisObjs = [];
            this.remoteUrl = k7.fairyUrlRemotePrefix;
            this.localUrl = k7.fairyUrlLocalPrefix;
            this.loaded = false;
            this.loading = false;
            this.retry = 0;
            this.loadtime = 0;
        }
        /**
         * 若正在加载过程中，重复调用，将只会注册不同的回调函数，但不会重复换起加载。
         * 加载成功后，将自动清除所有回调。
         *  若想维护监听状态，则不要传入回调函数，使用事件机制来处理回调。
         */
        load(callback, thisObj) {
            if (callback) {
                let cbidx = this.callbacks.indexOf(callback);
                let toidx = this.thisObjs.indexOf(thisObj);
                if (cbidx == -1 && toidx == -1) {
                    this.callbacks.push(callback);
                    this.thisObjs.push(thisObj);
                }
            }
            if (this.loaded) {
                this.complete();
                return;
            }
            if (this.loading) {
                return;
            }
            this.loading = true;
            this.startime = Date.now();
            this.retry += 1;
            this.start();
        }
        setRemoteUrl(remoteUrl) {
            this.remoteUrl = remoteUrl;
            return this;
        }
        setLocalUrl(localUrl) {
            this.localUrl = localUrl;
            return this;
        }
        setDir(dir) {
            this.dir = dir;
            return this;
        }
        setImportant(value) {
            this.important = value;
            return this;
        }
        /** 最终的加载URL，是只读的，实际URL通过设置三个变量实现 */
        get url() {
            return k7.addPrefix(this.remoteUrl, this.local);
        }
        /** 本地的最终文件路径(无后缀) */
        get local() {
            return k7.addPrefix(this.localUrl, k7.addPrefix(this.dir, this.fileName));
        }
        complete() {
            this.loading = false;
            this.loadtime += Date.now() - this.startime;
            for (let i = 0; i < this.callbacks.length; ++i) {
                let cb = this.callbacks[i];
                let to = this.thisObjs[i];
                cb && cb.apply(to);
            }
            mvc.send(k7.EVT_SourceLoader_Complete, this);
        }
        success() {
            this.loaded = true;
            this.complete();
        }
        failed() {
            this.complete();
        }
    }
    k7.ASourceLoader = ASourceLoader;
})(k7 || (k7 = {}));



(function (k7) {
    k7.FAIRY_DIR = '';
    class FairyLoader extends k7.ASourceLoader {
        constructor() {
            super();
            this.dir = k7.FAIRY_DIR;
            this.fileName = arguments[0];
            if (arguments.length > 1) {
                this.data = [];
                for (let i = 1; i < arguments.length; i += 2) {
                    let type = arguments[i];
                    let name = arguments[i + 1];
                    let inst = k7.getFairyInstence(type);
                    inst.name = name;
                    inst.pack = this.fileName;
                    inst.addUISource(this);
                    this.data.push({ type, name, inst });
                }
            }
        }
        start() {
            k7.fairy.loadPack(this.url, this.onLoadProcess.bind(this), this.onPackLoaded.bind(this));
        }
        onLoadProcess() {
        }
        onPackLoaded(pkg) {
            if (pkg && (pkg instanceof fgui.UIPackage)) {
                this.preCreateAppWindow();
            }
            else {
                super.failed();
            }
        }
        preCreateAppWindow(position = 0) {
            if (position == 0) {
                FUIPackage.addPackage(this.url);
            }
            if (this.data && this.data.length > 0 && position < this.data.length) {
                let win = this.data[position].inst;
                if (fgui.AsyncOperation) {
                    let create = new fgui.AsyncOperation();
                    create.callback = k7.engine.setCallback(this, gObject => {
                        win.contentPane = gObject.asCom;
                        this.preCreateAppWindow(position + 1);
                    });
                    create.createObject(this.fileName, win.name);
                }
                else {
                    win.contentPane = FUIPackage.createObject(this.fileName, win.name).asCom;
                    this.preCreateAppWindow(position + 1);
                }
            }
            else {
                super.success();
            }
        }
    }
    k7.FairyLoader = FairyLoader;
})(k7 || (k7 = {}));

(function (k7) {
    k7.IMAGE_DIR = '';
    class ImageLoader extends k7.ASourceLoader {
        constructor(name, suffix) {
            super();
            this.dir = k7.IMAGE_DIR;
            this.fileName = name;
            this.suffix = suffix;
        }
        start() {
            k7.loader.loadRes(this.url + '.' + this.suffix, 'image', texture => {
                this.texture = texture;
                texture ? super.success() : super.failed();
            });
        }
    }
    k7.ImageLoader = ImageLoader;
})(k7 || (k7 = {}));

(function (k7) {
    k7.JSON_DIR = '';
    class JsonLoader extends k7.ASourceLoader {
        constructor(name, resTarget, resName) {
            super();
            this.dir = k7.JSON_DIR;
            this.fileName = name;
            this.resTarget = resTarget;
            this.resName = resName;
        }
        start() {
            k7.loader.loadRes(this.url + '.json', 'json', fileData => {
                if (!fileData) {
                    super.failed();
                    return;
                }
                if (typeof fileData === 'string') {
                    try {
                        this.jsonData = JSON.parse(fileData);
                    }
                    catch (err) {
                        super.failed();
                        return;
                    }
                }
                else {
                    this.jsonData = fileData;
                }
                k7.JsonManager.addSource(this.fileName, this.jsonData);
                super.success();
            });
        }
    }
    k7.JsonLoader = JsonLoader;
})(k7 || (k7 = {}));



(function (k7) {
    k7.SKELETON_DIR = '';
    class SkeletonLoader extends k7.ASourceLoader {
        constructor() {
            super();
            this.dir = k7.SKELETON_DIR;
            this.fileName = arguments[0];
            this.skeleton = k7.skeleton.create();
            this.skeleton.aniInfo = [];
            for (let i = 1; i < arguments.length; i += 2) {
                this.skeleton.aniInfo.push({ addMode: arguments[i], loop: arguments[i + 1] });
            }
        }
        static createMore() {
            let arr = [];
            for (let i = 0; i < arguments.length; i += 1) {
                arr.push(new SkeletonLoader(arguments[i]));
            }
            return arr;
        }
        start() {
            this.skeleton.load(this.url + '.sk', this.onComplete, this);
        }
        onComplete() {
            let info = this.skeleton.aniInfo[0];
            if (!info)
                info = this.skeleton.aniInfo[0] = { addMode: false, loop: false };
            for (let i = 1; i < this.skeleton.aniInfo.length; i += 1) {
                if (!this.skeleton.aniInfo[i]) {
                    this.skeleton.aniInfo[i] = { addMode: info.addMode, loop: info.loop };
                }
            }
            if (this.skeleton.templet) {
                k7.SkeletonManager.addSource(this.fileName, this.skeleton);
                super.success();
            }
            else {
                super.failed();
            }
        }
    }
    k7.SkeletonLoader = SkeletonLoader;
})(k7 || (k7 = {}));

(function (k7) {
    k7.SOUND_DIR = '';
    class SoundLoader extends k7.ASourceLoader {
        constructor(name, suffix = 'mp3') {
            super();
            this.dir = k7.SOUND_DIR;
            this.fileName = name;
            this.suffix = suffix;
        }
        start() {
            if (this.sound) {
                super.success();
                return;
            }
            k7.loader.loadRes(this.url + '.' + this.suffix, 'sound', snd => {
                this.sound = snd;
                let s = k7.sound.create(this.sound, this.fileName);
                k7.SoundManager.addSource(this.fileName, s);
                snd ? super.success() : super.failed();
            });
        }
    }
    k7.SoundLoader = SoundLoader;
})(k7 || (k7 = {}));

(function (k7) {
    /** 整个preloader管理器完成加载结果发布(可能成功或失败，详见SourcePreLoader属性)，事件唯一参数类型：ASourceLoader */
    k7.EVT_SourcePreLoader_Complete = 'EVT_SourcePreLoader_CompleteEvent';
    /** 整个preloader加载遇到一些特殊事件时，自动处理后后将广播通知 */
    k7.EVT_SourcePreLoader_STATUS = 'EVT_SourcePreLoader_STATUS';
    class SourcePreLoader {
        constructor(label) {
            this._isLoading = false;
            this._isComplete = false;
            this._hasError = false;
            /** 该线程资源，加载失败后自动重试的次数 */
            this.retrysMax = 5;
            this.label = label;
            this._loaderList = [];
            this._childs = [];
        }
        get numSources() { return this._loaderList.length; }
        get isComplete() { return this._isComplete; }
        get isLoading() { return this._isLoading; }
        get hasError() { return this._hasError; }
        get timeUsed() { return this._timeUsed; }
        get numRetrys() { return this._numRetrys - this.numSources; }
        addSource() {
            this._isComplete = false;
            this._loaderList.push(...arguments);
        }
        getSource() {
            if (typeof arguments[0] == 'number') {
                return this._loaderList[arguments[0]];
            }
            else if (typeof arguments[0] == 'string') {
                for (let i = 0; i < this.numSources; i += 1) {
                    if (this._loaderList[i].fileName == arguments[0]) {
                        return this._loaderList[i];
                    }
                }
                if (arguments[1]) {
                    for (let i in this._childs) {
                        let s = this._childs[i].getSource(arguments[0], true);
                        if (s)
                            return s;
                    }
                }
            }
            return null;
        }
        getFairy() {
            return this.getSource.apply(this, arguments);
        }
        getImage() {
            return this.getSource.apply(this, arguments);
        }
        getJson() {
            return this.getSource.apply(this, arguments);
        }
        getSound() {
            return this.getSource.apply(this, arguments);
        }
        getSkeleton() {
            return this.getSource.apply(this, arguments);
        }
        getSourceFromUrl(url) {
            for (let i = 0; i < this.numSources; i += 1) {
                if (this._loaderList[i].url == url) {
                    return this._loaderList[i];
                }
            }
        }
        /** 从加载序列里移除一个加载(可能导致加载逻辑出错风险，仅限函数内部使用) */
        removeSource(fileName) {
            for (let i = 0; i < this.numSources; i += 1) {
                if (this._loaderList[i].fileName == fileName) {
                    return this._loaderList.splice(i, 1)[0];
                    ;
                }
            }
            return null;
        }
        higher() {
            if (arguments.length > 3) {
                console.warn('同时加载过多，可能导致下载效率下降，可创建branch分支，按序加载');
            }
            for (let i = 0; i < arguments.length; i += 1) {
                let source = this.getSource(arguments[i]);
                if (source === null)
                    continue;
                if (source.loaded || source.loading)
                    continue;
                source.load();
            }
        }
        branch() {
            let $branchLoader = new SourcePreLoader();
            $branchLoader._parent = this;
            this._childs.push($branchLoader);
            for (let i = 0; i < arguments.length; i += 1) {
                let source = this.removeSource(arguments[i]);
                if (source) {
                    $branchLoader.addSource(source);
                }
                else {
                    mvc.send(k7.EVT_SourcePreLoader_STATUS, `创建时${source}已不在${this.label}中了。`);
                }
            }
            return $branchLoader;
        }
        thread() {
            let $threadLoader = new SourcePreLoader();
            for (let i = 0; i < arguments.length; i += 1) {
                let source = this.getSource(arguments[i]);
                if (source) {
                    $threadLoader.addSource(source);
                }
                else {
                    mvc.send(k7.EVT_SourcePreLoader_STATUS, `创建时${source}已不在${this.label}中了。`);
                }
            }
            return $threadLoader;
        }
        start(pauseParent = true) {
            if (pauseParent && this._parent && this._parent.isLoading) {
                this._parent.stop();
                this._autoStartTarget = this._parent;
            }
            else {
                this._autoStartTarget = null;
            }
            //同一个现成不能从外部重复加载
            if (this._isLoading)
                return;
            this._stoped = false;
            this._startTime = Date.now();
            this._numRetrys = 0;
            this.preload();
        }
        preload(index = 0) {
            if (!this._reged) {
                mvc.on(k7.EVT_SourceLoader_Complete, this, this.onItemLoaded);
                this._reged = true;
            }
            // 若已经打过暂停标签，则停止加载
            if (this._stoped) {
                this._isLoading = false;
                return;
            }
            // 如果已经加载完毕，将不执行
            if (this._isComplete) {
                return;
            }
            // 如加载索引超界，重新重头检查是否有跳过的资源
            if (index >= this.numSources) {
                this._autoLoadFront();
                return;
            }
            // 获取即将加载的资源
            let item = this._loaderList[index];
            // 当前资源已在加载中，或已加载成功，自动加载下一个
            if (item.loading || item.loaded) {
                this.preload(index + 1);
                return;
            }
            // 当前资源重试的次数，已经大于阈值，被自动跳过，并自动加载下一个
            if (item.retry >= this.retrysMax) {
                this._hasError = true;
                mvc.send(k7.EVT_SourcePreLoader_STATUS, `${item.fileName}重试超过${item.retry}次，跳过。`);
                this.preload(index + 1);
                return;
            }
            this._isLoading = true;
            this._currIndex = index;
            this._currItem = item;
            this._currItem.load();
        }
        _autoLoadFront() {
            for (let i = 0; i < this.numSources; ++i) {
                let item = this._loaderList[i];
                //没有加载成功，且，没有正在加载
                if (!item.loaded && !item.loading) {
                    if (item.retry < this.retrysMax) {
                        this.preload(i);
                        return;
                    }
                    else {
                        this._hasError = true;
                        mvc.send(k7.EVT_SourcePreLoader_STATUS, `${item.fileName}重试超过${item.retry}次，跳过。`);
                    }
                }
            }
            if (!this._hasError) {
                this.complete();
            }
        }
        onItemLoaded(sourceLoader) {
            if (this._currItem === sourceLoader) {
                this._numRetrys += 1;
                let index = this._loaderList.indexOf(sourceLoader);
                if (index !== this._currIndex) {
                    mvc.send(k7.EVT_SourcePreLoader_STATUS, `完成时${sourceLoader.fileName}已不在${this.label}中了。`);
                    this._autoLoadFront();
                }
                else {
                    // 重要的加载，会立即重试
                    let ci = sourceLoader.important ?
                        this._currIndex : this._currIndex + 1;
                    this.preload(ci);
                }
            }
        }
        reload() {
            if (this._isLoading)
                return;
            if (this._isComplete && this._hasError) {
                this._isComplete = false;
                this._hasError = false;
                for (let i = 0; i < this._loaderList.length; ++i) {
                    this._loaderList[i].retry = 0;
                }
                this.preload();
            }
            else {
                this._stoped = false;
                this.preload();
            }
        }
        stop() {
            this._stoped = true;
            return this;
        }
        complete() {
            this._isComplete = true;
            this._isLoading = false;
            this._timeUsed = Date.now() - this._startTime;
            let label = this.label ? (':' + this.label) : '';
            mvc.send(k7.EVT_SourcePreLoader_Complete, this);
            console.log(`[PRELOADER${label}] Load Complete.`);
            if (this._autoStartTarget) {
                this._autoStartTarget.start();
                this._autoStartTarget = null;
            }
        }
        forEach(callback) {
            for (let i = 0; i < this.numSources; ++i) {
                if (callback(i, this._loaderList[i]))
                    return;
            }
        }
    }
    k7.SourcePreLoader = SourcePreLoader;
    k7.preloader = new SourcePreLoader('Main');
})(k7 || (k7 = {}));

(function (k7) {
    class SubPackLoader extends k7.ASourceLoader {
        /**
         * @param name 	分包的名字，可以填 name 或者 root
         */
        constructor(name) {
            super();
            this.fileName = name;
        }
        start() {
            let wx = window['wx'];
            if (wx && wx.loadSubpackage) {
                wx.loadSubpackage({
                    name: this.fileName,
                    success: res => {
                        this.success();
                    },
                    fail: res => {
                        this.failed();
                    }
                });
            }
            else {
                console.log('skip subpackage loader');
                this.success();
            }
        }
    }
    k7.SubPackLoader = SubPackLoader;
})(k7 || (k7 = {}));



(function (k7) {
    k7.ZIP_DIR = '';
    k7.ZIP_PRE = window['wx'] ? wx.env.USER_DATA_PATH + '/' : '';
    k7.ZIPLoaderGetPath = function () {
        return window['wx'] ? k7.ZIP_PRE + k7.ZIP_DIR : '';
    };
    class ZIPLoader extends k7.ASourceLoader {
        constructor(name) {
            super();
            this.dir = k7.ZIP_DIR;
            this.fileName = name;
        }
        start() {
            if (this.supportZip()) {
                // this.checkDirectory();
                this.downloadVersion();
            }
            else {
                this.success();
            }
        }
        parseJson(data) {
            let result = null;
            try {
                result = JSON.parse(data);
            }
            catch (err) {
                return null;
            }
            ;
            return result;
        }
        /** 版本文件比较失败 */
        versionCompareFail() {
            this.checkDirectory();
        }
        /** 下载版本文件 */
        downloadVersion() {
            wx.downloadFile({
                url: this.remoteUrl + 'version' + '.json',
                success: res => {
                    console.log("[ZIPLoader]: 下载远程版本文件成功", res);
                    this.readRemoteVersion(res.tempFilePath);
                },
                fail: res => {
                    console.log("[ZIPLoader]: 下载远程版本文件失败", res.errMsg);
                    this.versionCompareFail();
                },
            });
        }
        /** 读取远程版本文件 */
        readRemoteVersion(tempFilePath) {
            wx.getFileSystemManager().readFile({
                filePath: tempFilePath,
                encoding: 'utf-8',
                success: res => {
                    console.log('[ZIPLoader]: 读取远程版本文件成功', this.parseJson(res.data));
                    this._remoteVer = this.parseJson(res.data);
                },
                fail: err => {
                    console.log('[ZIPLoader]: 读取远程版本文件失败', err);
                    this._remoteVer = null;
                },
                complete: () => {
                    this.readLocalVersion();
                }
            });
        }
        /** 读取本地版本文件 */
        readLocalVersion() {
            let targetPath = k7.ZIP_PRE + 'version';
            wx.getFileSystemManager().readFile({
                filePath: targetPath,
                encoding: 'utf-8',
                success: res => {
                    console.log('[ZIPLoader]: 读取本地版本文件成功', this.parseJson(res.data));
                    this._localVer = this.parseJson(res.data);
                },
                fail: err => {
                    console.log('[ZIPLoader]: 读取本地版本文件失败', err);
                    this._localVer = null;
                },
                complete: () => {
                    this.compareVersion();
                }
            });
        }
        /** 比较远程版本与本地版本 */
        compareVersion() {
            if (this._remoteVer !== null && this._localVer !== null && this._remoteVer.version === this._localVer.version) {
                console.log(`[ZIPLoader]: 远程资源版本与本地版本一致，无需下载资源`);
                this.success();
            }
            else {
                console.log(`[ZIPLoader]: 远程资源版本与本地版本不一致，准备下载资源`);
                this.versionCompareFail();
            }
        }
        /** 当资源解压完成后将远程版本写入本地版本 */
        writeRemoteVersion() {
            let data = '';
            if (this._remoteVer && this._remoteVer.version) {
                data = JSON.stringify(this._remoteVer);
            }
            else {
                return;
            }
            let targetPath = k7.ZIP_PRE + 'version';
            wx.getFileSystemManager().writeFile({
                filePath: targetPath,
                data: data,
                encoding: 'utf-8',
                success: res => {
                    console.log('[ZIPLoader]: 写入版本文件成功', res);
                },
                fail: err => {
                    console.log('[ZIPLoader]: 写入版本文件失败', err);
                }
            });
        }
        supportZip() {
            return window['wx'] && wx.downloadFile && wx.getFileSystemManager();
        }
        /** 校验资源目录是否存在 */
        checkDirectory() {
            console.log("[ZIPLoader]: 开始校验缓存目录是否存在");
            let fs = wx.getFileSystemManager();
            let targetPath = k7.ZIP_PRE + k7.ZIP_DIR;
            fs.stat({
                path: targetPath,
                recursive: false,
                success: res => {
                    if (res && res.stats && res.stats.isDirectory()) {
                        console.log("[ZIPLoader]: 缓存目录存在");
                        this.rmCache();
                    }
                    else {
                        console.log("[ZIPLoader]: 缓存文件非目录");
                        this.downloadZip();
                    }
                },
                fail: err => {
                    console.log("[ZIPLoader]: 缓存目录不存在", err);
                    this.downloadZip();
                }
            });
        }
        /** 移除本地的资源文件 */
        rmCache() {
            console.log("[ZIPLoader]: 开始删除缓存目录");
            let fs = wx.getFileSystemManager();
            let targetPath = k7.ZIP_PRE + k7.ZIP_DIR;
            fs.rmdir({
                dirPath: targetPath,
                recursive: true,
                success: (res) => {
                    console.log("[ZIPLoader]: 缓存目录已删除");
                    this.downloadZip();
                },
                fail: (err) => {
                    console.log("[ZIPLoader]: 缓存目录删除失败");
                    this.failed();
                }
            });
        }
        /** 下载zip文件 */
        downloadZip() {
            console.log("[ZIPLoader]: 开始下载zip...");
            wx.downloadFile({
                url: this.remoteUrl + this.fileName + '.zip',
                success: res => {
                    console.log("[ZIPLoader]: 下载zip成功");
                    this.unzip(res.tempFilePath);
                },
                fail: res => {
                    console.log("[ZIPLoader]: 下载zip失败", res.errMsg);
                    this.failed();
                },
            });
        }
        /** 解压zip文件 */
        unzip(zipFilePath) {
            console.log("[ZIPLoader]: 开始解压文件");
            let targetPath = k7.ZIP_PRE + k7.ZIP_DIR;
            let fs = wx.getFileSystemManager();
            fs.unzip({
                zipFilePath,
                targetPath,
                success: () => {
                    console.log("[ZIPLoader]: 解压成功");
                    // const concent = fs.readdirSync(targetPath + this.fileName);
                    // console.log("压缩包内文件:",targetPath , concent);
                    this.writeRemoteVersion();
                    this.success();
                },
                fail: (res) => {
                    console.log("[ZIPLoader]: 解压失败", res.errMsg);
                    this.failed();
                },
            });
        }
    }
    k7.ZIPLoader = ZIPLoader;
})(k7 || (k7 = {}));

(function (k7) {
    var JsonManager;
    (function (JsonManager) {
        const source = {};
        function addSource(name, json) {
            source[name] = json;
        }
        JsonManager.addSource = addSource;
        function getSource(name) {
            return source[name];
        }
        JsonManager.getSource = getSource;
    })(JsonManager = k7.JsonManager || (k7.JsonManager = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var SkeletonManager;
    (function (SkeletonManager) {
        const source = {};
        function addSource(name, skeleton) {
            source[name] = skeleton;
        }
        SkeletonManager.addSource = addSource;
        /**
         * 根据一个SK文件的名称，获得对应的龙骨播放器包装盒，
         * 可以直接添加播放龙骨，
         * 包装盒统一管理了相同龙骨的原文件唯一，多播放实例复用的功能
         */
        function getSource(name) {
            return source[name];
        }
        SkeletonManager.getSource = getSource;
        /**
         *  获取引擎原生的龙骨动画对象
         * @param gComp 播放的坐标
         * @param name 动画的名称(SK名称)
         * @param useRepeat 若龙骨对象在该显示结点已存在重复的情况，则复用同一个播放
         * @returns 返回引擎原生的龙骨动画对象
         */
        function get(gComp, name, useRepeat = true) {
            return k7.fairy.addSkeleton(gComp, getSource(name), useRepeat);
        }
        SkeletonManager.get = get;
        /**
         *  播放龙骨动画
         * @param gComp 播放龙骨动画的显示列表(组件)
         * @param name 龙骨动画对应的资源名称(SK名称)
         * @param settings 龙骨播放设置
         *
         */
        function play(gComp, name, settings) {
            let sk = getSource(name);
            if (!sk)
                return null;
            let anis = sk.aniInfo;
            if (!anis)
                return null;
            if (typeof settings === 'number') {
                settings = { index: settings };
            }
            if (!settings)
                settings = { index: 0 };
            if (!settings.index && !settings.label)
                settings.index = 0;
            if (settings.index && settings.index >= anis.length)
                settings.index = 0;
            if (settings.useRepeat === undefined)
                settings.useRepeat = true;
            k7.fairy.addSkeleton(gComp, sk, settings.useRepeat);
            let conf;
            if (settings.index < anis.length) {
                conf = anis[settings.index];
            }
            let addMode = settings.add;
            if (settings.add === undefined && conf) {
                addMode = conf.addMode;
            }
            if (settings.loop || (conf && conf.loop)) {
                sk.loop(settings.label || settings.index, addMode);
            }
            else {
                sk.play(settings.label || settings.index, addMode);
            }
            //设置动画联动隐藏的对象
            if (settings.playingHideName) {
                settings.playingHideChild = gComp.getChild(settings.playingHideName);
            }
            //隐藏指定静态层功能，播放动画时会隐藏指定的显示对象，播放完毕会恢复显示
            let child = settings.playingHideChild;
            if (child) {
                child.visible = false;
            }
            if (settings.autoRemove || child || settings.complete) {
                let delay = settings.playingTime === undefined ? conf.time : settings.playingTime;
                k7.timer.delay(delay, () => {
                    if (child)
                        child.visible = true;
                    let sets = settings;
                    if (sets.autoRemove) {
                        sk.recycle();
                    }
                    if (sets.complete) {
                        sets.caller === undefined ? sets.complete(0) : sets.complete.call(sets.caller, 0);
                    }
                });
            }
            return sk;
        }
        SkeletonManager.play = play;
        function stop(gComp, name, playingHide) {
            let sk = get(gComp, name);
            if (sk && sk.stop)
                sk.stop();
            let child = typeof playingHide === 'string' ?
                gComp.getChild(playingHide) : playingHide;
            child && (child.visible = true);
        }
        SkeletonManager.stop = stop;
    })(SkeletonManager = k7.SkeletonManager || (k7.SkeletonManager = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var SoundManager;
    (function (SoundManager) {
        const source = {};
        function addSource(name, sound) {
            source[name] = sound;
        }
        SoundManager.addSource = addSource;
        function getSource(name) {
            return source[name];
        }
        SoundManager.getSource = getSource;
        /** 返回同一个类型的声音的当前播放实例 */
        function getChannel(name) {
            return channel_cache[name];
        }
        SoundManager.getChannel = getChannel;
        const _mutex = [];
        const channel_cache = {};
        /** 是否静音 */
        var muted = false;
        function addMutex() {
            let chs = _mutex.length > 0 ? channel_cache[_mutex[0]] : [];
            for (let i = 0; i < arguments.length; i += 1) {
                let f = arguments[i];
                if (_mutex.indexOf(f) === -1) {
                    _mutex.push(f);
                    channel_cache[f] = chs;
                }
            }
        }
        SoundManager.addMutex = addMutex;
        /** 设置静音，注意：设置静音之后，再播放声音不是调整音量0，而是不播 */
        function setMuted(value) {
            muted = value;
            if (value) {
                for (let key in channel_cache) {
                    fadesOut(channel_cache[key]);
                }
            }
            else {
                for (let key in channel_cache) {
                    fadesIn(channel_cache[key][0]);
                }
            }
        }
        SoundManager.setMuted = setMuted;
        /** 播放声音，并记录channel缓存，用于限制播放 */
        function play(filename, setting) {
            if (muted)
                return;
            let sound = getSource(filename);
            if (!sound)
                return;
            if (!setting)
                setting = {};
            let ch = null;
            /** 同个声音的多个播放实例缓存(互斥列表视为同一个) */
            let chc = channel_cache[filename];
            if (!chc)
                channel_cache[filename] = chc = [];
            let { max, complete, caller } = setting;
            if (isNaN(max) || max < 1) {
                max = 1;
            }
            if (chc.length < max) {
                ch = setting.loop ? sound.loop() : sound.play();
                setting.fadesIn && (ch.setVolume(0), fadesIn(ch));
                chc.push(ch);
                ch.onComplete(() => {
                    let di = chc.indexOf(ch);
                    di !== -1 && chc.splice(di, 1);
                    complete && (caller === undefined ? complete() : complete.call(caller));
                });
            }
            else if (setting.cover || setting.cover === undefined) {
                ch = chc[0];
                setting.fadesCover ? fadesOut(ch) : ch.stop();
                ch.onComplete(() => {
                    let di = chc.indexOf(ch);
                    di !== -1 && chc.splice(di, 1);
                    complete && (caller === undefined ? complete() : complete.call(caller));
                });
                setting.loop ? ch.loop() : ch.play();
                setting.fadesIn && (ch.setVolume(0), fadesIn(ch));
            }
            return ch;
        }
        SoundManager.play = play;
        /** 停止播放，并清理channel缓存 */
        function stop(channel) {
            channel.stop();
            for (let key in channel_cache) {
                let chs = channel_cache[key];
                let di = chs.indexOf(channel);
                di !== -1 && chs.splice(di, 1);
            }
        }
        SoundManager.stop = stop;
        /** 声音淡入(每次只能淡入1个声音) */
        function fadesIn(param, target = 1) {
            if (typeof param === 'string') {
                fadesIn(channel_cache[param][0]);
                return;
            }
            if (!param)
                return;
            function _fadesIn() {
                let sc = param;
                if (sc.getVolume() < target) {
                    sc.setVolume(sc.getVolume() + 0.01);
                }
                else {
                    k7.timer.clear(_fadesIn);
                }
            }
            k7.timer.frame(1, _fadesIn);
        }
        SoundManager.fadesIn = fadesIn;
        /** 声音淡出 */
        function fadesOut(param, thenStop, target = 0) {
            if (typeof param === 'string') {
                let chc = channel_cache[param];
                for (let i = 0; i < chc.length; i += 1) {
                    fadesOut(chc[i], thenStop);
                }
                return;
            }
            function _fadesOut() {
                let sc = param;
                ;
                if (sc.getVolume() > target) {
                    sc.setVolume(sc.getVolume() - 0.01);
                }
                else {
                    k7.timer.clear(_fadesOut);
                    thenStop && stop(sc);
                }
            }
            k7.timer.frame(1, _fadesOut);
        }
        SoundManager.fadesOut = fadesOut;
    })(SoundManager = k7.SoundManager || (k7.SoundManager = {}));
})(k7 || (k7 = {}));

(function (k7) {
    function addPrefix(prefix, url) {
        if (prefix && typeof prefix === 'string') {
            if (prefix.charAt(prefix.length - 1) === '/') {
                return prefix + url;
            }
            else {
                return prefix + '/' + url;
            }
        }
        else {
            return url;
        }
    }
    k7.addPrefix = addPrefix;
})(k7 || (k7 = {}));

(function (k7) {
    /**
     *  获取贝塞尔曲线中的某一个点
     * @param cps 贝塞尔选点数组
     * @param t 终点比例系数(0-1)
     * @param rst 缓存点的数组
     */
    function getBezierPoint(cps, t, rst) {
        let l = cps.length - 1, x = 0, y = 0;
        for (let i = 0; i < cps.length; i += 1) {
            let m = Math.pow((1 - t), l - i) * Math.pow(t, i) * getBinomial(l, i);
            x += m * cps[i].x;
            y += m * cps[i].y;
        }
        let res = { x, y };
        rst && rst.push(res);
        return res;
    }
    k7.getBezierPoint = getBezierPoint;
    /**
     *  获取二项式某一位的值
     * @param l 长度(从0计算)
     * @param i 第几位(从0计算)
     */
    function getBinomial(l, i) {
        let num = 1, den = 1;
        for (; i > 0; i -= 1, l -= 1) {
            den *= i;
            num *= l;
        }
        return num / den;
    }
    k7.getBinomial = getBinomial;
})(k7 || (k7 = {}));

(function (k7) {
    /** 匀速缓动函数
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    function easeNone(t, b, c, d) {
        return c * t / d + b;
    }
    k7.easeNone = easeNone;
    function easeQuadOut(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    }
    k7.easeQuadOut = easeQuadOut;
})(k7 || (k7 = {}));
