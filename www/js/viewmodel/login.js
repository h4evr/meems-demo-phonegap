/*global define*/
define([
    "meems",
    "server_conf"
], function (Meems, ServerConf) {
    var Utils = Meems.Utils;

    var performLogin = function (email, password, cb) {
        Utils.Ajax.request({
            url: ServerConf.url + 'user/login',
            format: "json",
            method: "POST",
            params: {
                email: email,
                password: password
            },

            done: Utils.Fn.bind(function (resp) {
                if (resp.statusCode === 200) {
                    cb();
                } else if (resp.statusCode === 403) {
                    this.view.password("");
                    alert("Invalid credentials, please try again.");
                } else {
                    alert("An error occurred, please try again later.");
                }
            }, this)
        });
    };

    var LoginViewModel = {
        view : null,

        init : function (parentController, view) {
            this.parentController = parentController;
            this.view = view || this.view;

            if ("localStorage" in window && window.localStorage["email"] && window.localStorage["password"]) {
                this.view.username(window.localStorage["email"]);
                this.view.password(window.localStorage["password"]);

                performLogin(window.localStorage["email"], window.localStorage["password"],
                    Utils.Fn.bind(function () {
                        this.parentController.navigateTo("main");
                    }, this));
            }

            this.view.ui.on("login", Utils.Fn.bind(function () {
                var email = this.view.username(),
                    password = this.view.password();

                performLogin.call(this, email, password, Utils.Fn.bind(function () {
                    this.parentController.navigateTo("main");

                    if ("localStorage" in window) {
                        window.localStorage["email"] = email;
                        window.localStorage["password"] = password;
                    }
                }, this));
            }, this));
        }
    };

    return LoginViewModel;
});