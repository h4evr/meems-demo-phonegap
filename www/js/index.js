/*globals require */
require.config({
    paths: {
        "meems": "./lib/meems.min",
        "view": "./view",
        "viewmodel": "./viewmodel",
        "server_conf": "./server_conf"
    }
});
function loadCss(urls) {
    "use strict";

    var link,
        head = document.getElementsByTagName("head")[0],
        firstSibling = head.childNodes[0];

    for (var i = 0, ln = urls.length; i < ln; ++i) {
        link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = urls[i];
        head.insertBefore(link, firstSibling);
    }
}

window.hasPhoneGap = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

function init() {
    require([
        "meems",
        /* Views */
        "view/phone",
        /* ViewModels */
        "viewmodel/phone"],
    function (Meems, PhoneUI, PhoneViewModel) {
        "use strict";
        var Utils = Meems.Utils, Scroll = Meems.Scroll, Events = Meems.Events;

        var cssPath = "css/meems/";
        var theme = Utils.Dom.userAgent();

        loadCss([
            cssPath + theme + "/ui.css",
            cssPath + theme + "/icons.css",
            cssPath + theme + "/effects.css"
        ]);

        var phoneUi = new PhoneUI();
        PhoneViewModel.init(phoneUi);
        phoneUi.refresh();

        Events.Dom.on(window, 'resize', Utils.Fn.throttle(Scroll.updateAll, 100));
        document.body.appendChild(phoneUi.ui.el());
        Scroll.updateAll();
    });
}

if (hasPhoneGap) {
    document.addEventListener('deviceready', init, false);
} else {
    init();
}