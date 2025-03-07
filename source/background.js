import {Xdebug} from './Xdebug.js';

chrome.runtime.onInstalled.addListener(async () => {
    let xdebug = new Xdebug();
    await xdebug.init();
    if (!xdebug.ide_key) {  // Fix setting reset when updated
        let defaultSetting = {
            ide_key: 'PHPSTORM',
            trace_key: '',
            profile_key: '',
            disablePopup: 0
        };
        chrome.storage.sync.set(defaultSetting);
    }
    
    // Initialize icon and badge
    await Xdebug.refreshIcon();
});

chrome.tabs.onActivated.addListener(Xdebug.onPageChange);
chrome.tabs.onUpdated.addListener(Xdebug.onPageChange);

chrome.action.onClicked.addListener(async () =>{
    await Xdebug.toggleDebug();
    await Xdebug.refreshIcon();
});

