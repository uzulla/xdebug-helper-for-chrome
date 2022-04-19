import {Xdebug} from "./Xdebug.js";
window.onload = async function () {
    // switch mode event
    let buttons = document.querySelectorAll("a.action");
    buttons.forEach(function(elem) {
        elem.addEventListener("click", async function () {
            let mode = elem.getAttribute('data-mode');
            let xdebug = new Xdebug();
            await xdebug.changeModeTo(mode);
            await Xdebug.refreshIcon();

            // close popup
            window.close();
        });
    });

    let mode = await Xdebug.getCurrentMode();
    document.getElementById('action-'+mode).classList.add('active');
};
