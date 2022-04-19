import * as Constants from "./Constants.js";

export class CookieHelper {
    origin = '';

    async init() {
        this.origin = await this.getOrigin();
    }

    async getOrigin() {
        const queryOptions = {active: true, currentWindow: true};
        let [tab] = await chrome.tabs.query(queryOptions);
        if (!tab.url || tab.url.startsWith('chrome-extension:')) {
            return '';
        }

        let url = tab.url.replace(/^(view-source:)/, "");    // maybe remove "view-source:"

        const {origin} = new URL(url);
        return origin;
    }

    static checkCookieName(name) {
        let allowedCookies = [Constants.COOKIE_DEBUG, Constants.COOKIE_TRACE, Constants.COOKIE_PROFILE];
        if (allowedCookies.includes(name)) {
            return true;
        }
        throw new Error("Shouldn't access this cookie: " + name);
    }


    async getCookie(name) {
        CookieHelper.checkCookieName(name);
        if (!this.origin) {
            return ;
        }
        const cookieDetails = {name: name, url: this.origin};
        return await chrome.cookies.get(cookieDetails);
    }

    async deleteCookies(names) {
        for (let name of names) {
            CookieHelper.checkCookieName(name);
            let cookieDetails = {name: name, url: this.origin};
            await chrome.cookies.remove(cookieDetails)
        }
    }

    async setCookie(name, value) {
        CookieHelper.checkCookieName(name);
        const cookieDetails = {name: name, url: this.origin, value: value};
        await chrome.cookies.set(cookieDetails);
    }
}