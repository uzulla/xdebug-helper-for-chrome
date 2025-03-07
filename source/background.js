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

// Listen for tab activation (switching tabs)
chrome.tabs.onActivated.addListener(Xdebug.onPageChange);

// Listen for tab updates (including page loads and reloads)
// The third parameter (changeInfo) contains information about what changed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only trigger when the page has completed loading
    // This ensures we update the icon after the page is fully loaded
    if (changeInfo.status === 'complete') {
        Xdebug.onPageChange();
    }
});

chrome.action.onClicked.addListener(async () =>{
    await Xdebug.toggleDebug();
    await Xdebug.refreshIcon();
});

