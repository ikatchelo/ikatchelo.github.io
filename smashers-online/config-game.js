const _st = Date.now();
const _url = '';
const _appVer = '1.0.0';
const _resVer = '1.0.0';
const _appId = '60058';
window.getAppId = () => { return _appId; }
window.getTimer = () => { return Date.now() - _st; }
window.getVersion = () => { return _appVer; }
window.getCdn = (ver) => { return `${_url}/v${ver || _resVer}/`; }
window.getCdnVersionManifest = () => { return `${_url}/version.manifest`; }
window.getPlatform = () => { return '4399'; }
window.getDebug = () => { return true; }