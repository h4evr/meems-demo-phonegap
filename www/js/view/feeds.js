define(["meems"], function(Meems) {
    var UI = Meems.UI, Utils = Meems.Utils, Events = Meems.Events, Obs = Meems.Observable;

    function FeedsView(parentView) {
        var itemTemplate =
            "<div class=\"feed\">" +
                "<div class=\"icon\">" +
                    "{{#icon}}<img src=\"{{icon}}\">{{/icon}}" +
                "</div>" +
                "<div class=\"name\">{{name}}</div>" +
                "<div class=\"summary\">{{summary}}</div>" +
                "<div class=\"clear\"></div>" +
            "</div>",
            manageItemTemplate =
            "<table style=\"width:100%;\"><tr><td><div class=\"feed\">" +
                "<div class=\"icon\">" +
                    "<img src=\"{{icon}}\">" +
                "</div>" +
                "<div class=\"name\">{{name}}</div></td><td width=\"30px\">" +
                "<div class=\"ui-button ui-button-normal ui-button-red remove\">" +
                    "<div class=\"ui-icon ui-icon-delete\"></div>" +
                    "<div class=\"ui-title\">Delete</div>" +
                "</div></td>" +
            "</div></tr></table><div class=\"clear\"></div>";

        var feeds = Obs.observableArray([]),
            tempFeeds = Obs.observableArray([]),
            title = "Feeds",

            feedsList = UI.create("list")
                /* Bind to an observable array. */
                .items(tempFeeds)
                .template(itemTemplate)
                .attr('style', 'normal')
                .attr('sortable', true)
                .attr('selectionMode', 'multiple')
                .on("item:clicked", function (eventName, item, e) {
                    //pageHolder.fire("feeds:clicked", item);
                    return true;
                })
                .on("selection:changed", function (eventName, selection) {
                    if (selection.length > 0) {
                        pageManageFeeds.facet("footer", contextMenuFooter).update(true);
                    } else {
                        pageManageFeeds.facet("footer", null).update(true);
                    }
                    Utils.Dom.applyChanges();
                }),

            contextMenuFooter = UI.create("footer")
                .facet("buttons", UI.create("buttongroup").buttons([
                    UI.create("button").attr("action", "delete").attr("style", "icon").attr("title", "Delete").attr("icon", "delete")
                ]).on("button:pressed", function (eventName, button) {
                    var action = button.attr("action");

                    if (action === 'delete') {
                        tempFeeds.removeAll(feedsList.getSelectedItems());
                        feedsList.update();
                        Utils.Dom.applyChanges();
                    }
                })),

            btnRefreshIcon = Obs.observable("refresh"),
            pageHolder = UI.create("pageholder", parentView),
            pageFeeds =
            UI.create("page", pageHolder)
                .attr("enableScroll", true)
                /* Create the page's header */
                .facet("header",
                    UI.create("header")
                        .attr("title", title)
                        .facet("buttonsright",
                            UI.create("buttongroup")
                                .addButton(UI.create("button")
                                    .attr("title", "Manage")
                                    .attr("icon", "add")
                                    .attr("action", "manage"))
                                .addButton(UI.create("button")
                                    .attr("title", "Refresh")
                                    .attr("icon", btnRefreshIcon)
                                    .attr("action", "refresh"))
                                .on("button:pressed", function (eventName, btn) {
                                    switch (btn.attr('action')) {
                                        case 'manage':
                                            pageFeeds.fire("feeds:manage");
                                            pageHolder.currentPage(pageManageFeeds);
                                            Utils.Dom.applyChanges();
                                            break;
                                        case 'refresh':
                                            btnRefreshIcon("loading");
                                            Utils.Dom.applyChanges();

                                            pageFeeds.fire("feeds:refresh", function () {
                                                btnRefreshIcon("refresh");
                                                Utils.Dom.applyChanges();
                                            });
                                            break;
                                    }

                                })))

                /* Create the page's content */
                .facet("content",
                    UI.create("list")
                        /* Bind to an observable array. */
                        .items(feeds)
                        .template(itemTemplate)
                        .attr('style', 'normal')
                        .on("item:clicked", function (eventName, item) {
                            pageHolder.fire("feeds:clicked", item);
                            return true;
                        })),

            newUrl = Obs.observable(""),
            /*switchVal = Obs.observable(false),
            switchVal2 = Obs.observable(true),
            switchVal3 = Obs.observable(false),
            sliderVal = Obs.observable(50),
            sliderVal2 = Obs.observable(125),*/

            pageManageFeeds =
            UI.create("page", pageHolder)
                .attr("enableScroll", true)
                .facet("header",
                    UI.create("header")
                        .attr("title", title)
                        .facet("buttonsleft",
                            UI.create("buttongroup")
                                .addButton(UI.create("button")
                                    .attr("title", "Back")
                                    .attr("icon", "back")
                                    .attr("action", "back"))
                                .on("button:pressed", function (eventName, btn) {
                                    switch (btn.attr('action')) {
                                        case 'back':
                                            pageManageFeeds.fire("feeds:cancel", function (goBack) {
                                                if (goBack) {
                                                    pageHolder.currentPage(pageFeeds);
                                                    Utils.Dom.applyChanges();
                                                }
                                            });
                                            break;
                                    }
                                }))
                        .facet("buttonsright",
                            UI.create("buttongroup")
                                .addButton(UI.create("button")
                                    .attr("title", "Save")
                                    .attr("icon", "save")
                                    .attr("action", "save"))
                                .on("button:pressed", function (eventName, btn) {
                                    switch (btn.attr('action')) {
                                        case 'save':
                                            pageManageFeeds.fire("feeds:save", function (goBack) {
                                                if (goBack) {
                                                    pageHolder.currentPage(pageFeeds);
                                                    Utils.Dom.applyChanges();
                                                }
                                            });
                                            break;
                                    }
                                })))
                 /* Create the page's content */
                .facet("content",
                    UI.create("group")
                        .attr("customClass", "ui-align-right")
                        .appendChild(
                            UI.create("form")
                                .addField(UI.create("textfield").attr("label", "URL").value(newUrl))
                                /*.addField(UI.create("switch").attr("label", "demo").value(switchVal))
                                .addField(UI.create("switch").attr("label", "demo 2").value(switchVal2))
                                .addField(UI.create("switch").attr("label", "demo 3").value(switchVal3))
                                .addField(UI.create("slider").attr("label", "Volume").value(sliderVal).attr("minimum",0).attr("maximum",100))
                                .addField(UI.create("slider").attr("label", "Volume").value(sliderVal2).attr("minimum",100).attr("maximum",200))*/
                        )
                        .appendChild(UI.create("button").attr("title", "Add")
                            .on("dom:" + Events.Touch.touchEndEventName, function () {
                                var url = newUrl();

                                if (url.length > 0) {
                                    pageManageFeeds.fire("feeds:add", url);
                                    newUrl("");
                                }
                            }))
                        .appendChild(feedsList));

        pageHolder.pages([ pageFeeds, pageManageFeeds ]);

        this.ui = pageHolder;
        this.feeds = feeds;
        this.tempFeeds = tempFeeds;

        return this;
    }

    return FeedsView;
});