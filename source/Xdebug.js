import * as Constants from "./Constants.js";
import {CookieHelper} from './CookieHelper.js'

class Xdebug {

    ide_key = '';
    trace_key = '';
    profile_key = '';
    disablePopup = 0;

    static MODE_DEBUG = 'debug';
    static MODE_PROFILE = 'profile';
    static MODE_TRACE = 'trace';
    static MODE_DISABLE = 'disable';


    async init() {
        [this.ide_key, this.trace_key, this.profile_key, this.disablePopup] = await Promise.all([
            this.getSetting("ide_key"),
            this.getSetting("trace_key"),
            this.getSetting("profile_key"),
            this.getSetting("disablePopup")
        ]);
    }

    getSetting(key) {
        return new Promise(resolve => {
            chrome.storage.sync.get(key, val => {
                resolve(val[key]);
            });
        })
    }

    static async getCurrentMode() {
        let cookie = new CookieHelper();
        await cookie.init();
        if (!cookie.origin) {
            return Xdebug.MODE_DISABLE;
        }
        if (await cookie.getCookie(Constants.COOKIE_DEBUG)) {
            return Xdebug.MODE_DEBUG;
        } else if (await cookie.getCookie(Constants.COOKIE_PROFILE)) {
            return Xdebug.MODE_PROFILE;
        } else if (await cookie.getCookie(Constants.COOKIE_TRACE)) {
            return Xdebug.MODE_TRACE;
        }
        return Xdebug.MODE_DISABLE;
    }

    async changeModeTo(mode) {
        let cookie = new CookieHelper();
        await cookie.init();
        await this.init();

        if (!cookie.origin) {
            return;
        }

        // delete all cookies
        await cookie.deleteCookies([Constants.COOKIE_DEBUG, Constants.COOKIE_PROFILE, Constants.COOKIE_TRACE]);
        // ...and then write the correct cookie
        switch (mode) {
            case Xdebug.MODE_DEBUG:
                await cookie.setCookie(Constants.COOKIE_DEBUG, this.ide_key)
                break;
            case Xdebug.MODE_PROFILE:
                await cookie.setCookie(Constants.COOKIE_PROFILE, this.profile_key)
                break;
            case Xdebug.MODE_TRACE:
                await cookie.setCookie(Constants.COOKIE_TRACE, this.trace_key)
                break;
            case Xdebug.MODE_DISABLE:
                break;
        }
    }

    static async refreshIcon() {
        let mode = await  Xdebug.getCurrentMode();
        const queryOptions = {active: true, currentWindow: true};
        let [tab] = await chrome.tabs.query(queryOptions);
        let icons = {
            [Xdebug.MODE_DISABLE]: "/images/bug-gray.png",
            [Xdebug.MODE_PROFILE]: "/images/clock.png",
            [Xdebug.MODE_DEBUG]: "/images/bug.png",
            [Xdebug.MODE_TRACE]: "/images/script.png",
        }
        await chrome.action.setIcon({path: icons[mode], tabId: tab.id});
    }

    static async toggleDebug() {
        let xdebug = new Xdebug();
        await xdebug.init();
        let currentMode = await this.getCurrentMode();
        let distMode = currentMode === Xdebug.MODE_DEBUG ? Xdebug.MODE_DISABLE : Xdebug.MODE_DEBUG;
        await xdebug.changeModeTo(distMode);
    }

    static async checkPopup() {
        let xdebug = new Xdebug();
        await xdebug.init();
        let disablePopup = await xdebug.getSetting('disablePopup');
        if (disablePopup) {
            chrome.action.setPopup({popup: ''});
        }else{
            chrome.action.setPopup({popup: 'popup.html'});
        }
    }

    static async onPageChange() {
        await Xdebug.refreshIcon();
        await Xdebug.checkPopup();
    }
}

export {Xdebug, CookieHelper}