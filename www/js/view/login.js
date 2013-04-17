define(["meems"], function(Meems) {
    var UI = Meems.UI,
        Events = Meems.Events,
        Obs = Meems.Observable;

    function LoginView() {
        var title = Obs.observable("RSS Reader"),
            username = Obs.observable(""),
            password = Obs.observable("");

        var pageLogin =
            UI.create("page")
                .attr("enableScroll", false)
                .facet("header",
                    UI.create("header")
                        .attr("title", title)
                        .facet("buttonsright",
                            UI.create("buttongroup")
                                .addButton(UI.create("button")
                                    .attr("title", "Login")
                                    .attr("icon", "accept")
                                    .on('dom:' + Events.Touch.touchEndEventName, function () {
                                        pageLogin.fire("login");
                                    }))))
                .facet("content",
                    UI.create("form")
                        .addField(UI.create("textfield").attr("label", "Email").attr("type", "email").value(username))
                        .addField(UI.create("textfield").attr("label", "Password").attr("type", "password").value(password)));

        this.ui = pageLogin;
        this.username = username;
        this.password = password;

        return this;
    }

    return LoginView;
});
