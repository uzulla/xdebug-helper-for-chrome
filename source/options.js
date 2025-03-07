import {Xdebug} from "./Xdebug.js";

(async function () {
    let xdebug = new Xdebug();
    await xdebug.init();
    document.getElementById('ide_key').value = xdebug.ide_key;
    document.getElementById('profile_key').value = xdebug.profile_key;
    document.getElementById('trace_key').value = xdebug.trace_key;
    document.getElementById('disable-popup').checked = xdebug.disablePopup;
    
    // Get version from manifest.json and update the version display
    const manifestData = await fetch(chrome.runtime.getURL('manifest.json')).then(response => response.json());
    const versionElement = document.querySelector('.version');
    if (versionElement) {
        versionElement.textContent = `Xdebugを開始する君 v${manifestData.version}`;
    }
}());

// most used keys
let mostUsedKeys = document.getElementsByClassName('most_used_key');
for (let i = 0; i < mostUsedKeys.length; i++) {
    mostUsedKeys[i].addEventListener('click', function () {
        document.getElementById('ide_key').value = mostUsedKeys[i].innerHTML;
        document.getElementsByClassName('save-button')[0].click();
    });
}

// save setting
let buttons = document.getElementsByClassName('save-button');
for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
        let ide_key = document.getElementById('ide_key').value;
        let trace_key = document.getElementById('trace_key').value;
        let profile_key = document.getElementById('profile_key').value;
        chrome.storage.sync.set({ide_key, trace_key, profile_key});
    });
}

// disable popup
document.getElementById('disable-popup').addEventListener('change', async function (event, elem) {
    let isChecked = event.target.checked;
    await chrome.storage.sync.set({disablePopup: isChecked ? 1 : 0});
});
