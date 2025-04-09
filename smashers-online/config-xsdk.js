let xsdk_conf = window["xsdk_conf"] || (window["xsdk_conf"] = {});
let app_vers = window["getVersion"] ? window.getVersion() || '' : '';
let app_id = window["getAppId"] ? +window.getAppId() || 60000 : 60000;
