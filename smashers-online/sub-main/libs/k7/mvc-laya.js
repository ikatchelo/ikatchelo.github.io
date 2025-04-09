window.mvc = {};

(function (mvc) {
    var eventDispatcher;
    /**
     * 初始化 mvc功能，需要使用标准接口，实现事件收发器（具体参考各大引擎）
     * @param evtInst
     */
    function init(evtInst) {
        if (!eventDispatcher)
            eventDispatcher = evtInst;
    }
    mvc.init = init;
    class Mediator {
        constructor(name, view) {
            this.mediatorName = name;
            this.viewComponent = view;
            this._eventList = [];
        }
        get eventList() {
            return this._eventList;
        }
        onRegister() { }
        onEvent(eventName, params) { }
        onRemove() { }
    }
    mvc.Mediator = Mediator;
    /**
     * 发布一个事件，会同时响应：所有mvc.on监听的事件、新的ICommand实例、IMediator的onEvent函数。
     * 3个响应方式级别相同，先后顺序由注册顺序决定
     * 自定义的函数响应，使用on注册，使用off关闭，使用once监听一次自动关闭
     * Mediator使用registerMediator注册，使用removeMediator关闭
     * Command使用registerCommand注册，使用removeCommand关闭
     * @param eventName 事件名
     * @param params 事件参数
     */
    function send(eventName, params = null) {
        if (undefined === params) {
            eventDispatcher.event(eventName);
        }
        else {
            eventDispatcher.event(eventName, params);
        }
    }
    mvc.send = send;
    function on(eventName, thisObj, callback) {
        eventDispatcher.on(eventName, thisObj, callback);
    }
    mvc.on = on;
    function off(eventName, thisObj, callback) {
        eventDispatcher && eventDispatcher.off(eventName, thisObj, callback);
    }
    mvc.off = off;
    function once(eventName, thisObj, callback) {
        function onceListener() {
            callback.apply(thisObj, arguments);
            eventDispatcher.off(eventName, thisObj, onceListener);
        }
        eventDispatcher.on(eventName, thisObj, onceListener);
    }
    mvc.once = once;
    const commandMap = {}; //boolean map
    function registerCommand(eventName, commandClassRef) {
        commandMap[eventName] = true;
        eventDispatcher.on(eventName, null, executeCommand, [eventName, commandClassRef]);
    }
    mvc.registerCommand = registerCommand;
    function removeCommand(eventName) {
        if (commandMap[eventName]) {
            commandMap[eventName] = false;
            eventDispatcher.off(eventName, null, executeCommand);
        }
    }
    mvc.removeCommand = removeCommand;
    function hasCommand(eventName) {
        return commandMap[eventName];
    }
    mvc.hasCommand = hasCommand;
    function executeCommand(eventName, CommandClassRef, params) {
        new CommandClassRef().execute(eventName, params);
    }
    const mediatorMap = {};
    const inMediatorMap = {}; //boolean map
    function registerMediator(mediator) {
        var name = mediator.mediatorName;
        if (mediatorMap[name])
            return;
        mediatorMap[name] = mediator;
        var interests = mediator.eventList;
        var len = interests.length;
        for (var i = 0; i < len; i += 1) {
            let inter = interests[i];
            if (typeof inter === 'string') {
                inMediatorMap[inter] = true;
                eventDispatcher.on(inter, mediator, mediator.onEvent, [inter]);
            }
            else {
                let { name, handler } = inter;
                if (typeof handler == 'function') {
                    inMediatorMap[name] = true;
                    eventDispatcher.on(name, mediator, handler);
                }
                else {
                    for (var j = 0; j < handler.length; j++) {
                        inMediatorMap[name] = true;
                        eventDispatcher.on(name, mediator, handler[j]);
                    }
                }
            }
        }
        mediator.onRegister();
    }
    mvc.registerMediator = registerMediator;
    function removeMediator(mediatorName) {
        var mediator = mediatorMap[mediatorName];
        if (!mediator)
            return null;
        var interests = mediator.eventList;
        var i = interests.length;
        while ((i -= 1) > -1) {
            let inter = interests[i];
            if (typeof inter == 'string') {
                inMediatorMap[inter] = false;
                eventDispatcher.off(inter, mediator, mediator.onEvent);
            }
            else {
                let { name, handler } = inter;
                if (typeof handler == 'function') {
                    inMediatorMap[name] = false;
                    eventDispatcher.off(name, mediator, handler);
                }
                else {
                    for (var j = 0; j < handler.length; j++) {
                        inMediatorMap[name] = false;
                        eventDispatcher.off(name, mediator, handler[j]);
                    }
                }
            }
        }
        delete mediatorMap[mediatorName];
        mediator.onRemove();
        return mediator;
    }
    mvc.removeMediator = removeMediator;
    function retrieveMediator(mediatorName) {
        return mediatorMap[mediatorName] || null;
    }
    mvc.retrieveMediator = retrieveMediator;
    function hasMediator(mediatorName) {
        return mediatorMap[mediatorName] != null;
    }
    mvc.hasMediator = hasMediator;
    function hasInMediator(eventName) {
        return inMediatorMap[eventName];
    }
    mvc.hasInMediator = hasInMediator;
})(mvc || (mvc = {}));
mvc.init(new Laya.EventDispatcher);
