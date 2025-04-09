let mapi_conf = window["mapi_conf"] || (window["mapi_conf"] = {});
mapi_conf.appid = window["getAppId"] ? window.getAppId() || '' : '';

mapi_conf.gameid = '640';
mapi_conf.stage = 'prod';
mapi_conf.appSecret = '';