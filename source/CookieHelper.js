import * as Constants from "./Constants.js";

export class CookieHelper {
    origin = '';
    storeId = '-1';
    tabId = 0;

    async init() {
        const queryOptions = {active: true, currentWindow: true};
        let [tab] = await chrome.tabs.query(queryOptions);
        if (!tab.url || tab.url.startsWith('chrome-extension:')) {
            return '';
        }

        let url = tab.url.replace(/^(view-source:)/, "");    // maybe remove "view-source:"

        const {origin} = new URL(url);
        this.origin = origin;
        this.tabId = tab.id;
        this.storeId = await this.getStoreId();
    }


    static checkCookieName(name) {
        let allowedCookies = [Constants.COOKIE_DEBUG, Constants.COOKIE_TRACE, Constants.COOKIE_PROFILE];
        if (allowedCookies.includes(name)) {
            return true;
        }
        throw new Error("Shouldn't access this cookie: " + name);
    }

    async getStoreId() {
        if (this.storeId !== '-1') {
            return this.storeId;
        }
        return new Promise(resolve => {
            chrome.cookies.getAllCookieStores((cookieStores => {
                console.log(cookieStores)
                for (let i = 0; i < cookieStores.length; i++) {
                    if(cookieStores[i].tabIds.includes(this.tabId)){
                        resolve(cookieStores[i].id);
                        return;
                    }
                }
                resolve('0');
            }));
        });
    }


    async getCookie(name) {
        CookieHelper.checkCookieName(name);
        if (!this.origin) {
            return;
        }
        try {
            const cookieDetails = {name: name, url: this.origin, storeId: await this.getStoreId()};
            return await chrome.cookies.get(cookieDetails);
        } catch (error) {
            console.log(`Cookie access error for ${this.origin}: ${error.message}`);
            return null;
        }
    }

    async deleteCookies(names) {
        if (!this.origin) {
            return;
        }
        for (let name of names) {
            try {
                CookieHelper.checkCookieName(name);
                let cookieDetails = {name: name, url: this.origin, storeId: await this.getStoreId()};
                await chrome.cookies.remove(cookieDetails);
            } catch (error) {
                console.log(`Cookie deletion error for ${this.origin}: ${error.message}`);
            }
        }
    }

    async setCookie(name, value) {
        if (!this.origin) {
            return;
        }
        try {
            CookieHelper.checkCookieName(name);
            const cookieDetails = {name: name, url: this.origin, value: value, storeId: await this.getStoreId()};
            await chrome.cookies.set(cookieDetails);
        } catch (error) {
            console.log(`Cookie set error for ${this.origin}: ${error.message}`);
        }
    }
}
