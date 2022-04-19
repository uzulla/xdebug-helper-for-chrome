import {Xdebug} from './Xdebug.js';

chrome.runtime.onInstalled.addListener(() => {
    let defaultSetting = {
        ide_key: 'PHPSTORM',
        trace_key: '',
        profile_key: '',
        disablePopup: 0
    };
    chrome.storage.sync.set(defaultSetting);
});

chrome.tabs.onActivated.addListener(Xdebug.onPageChange);
chrome.tabs.onUpdated.addListener(Xdebug.onPageChange);

chrome.action.onClicked.addListener(async () =>{
    await Xdebug.toggleDebug();
    await Xdebug.refreshIcon();
});

