/*global define*/
define(["meems"], function(Meems) {
    var UI = Meems.UI, Utils = Meems.Utils, Events = Meems.Events, Obs = Meems.Observable;

    function NewsView(parentView) {
        var itemTemplate =
            "<div class=\"news\">" +
                "<div class=\"title\">{{title}}</div>" +
                "<div class=\"date\">{{formattedDate}}</div>" +
                "<div class=\"author\">{{author}}</div>" +
                "<div class=\"summary\">{{&summary}}</div>" +
                "<div class=\"clear\"></div>" +
            "</div>";

        var news = Obs.observableArray([]),
            title = Obs.observable("News"),
            pageNews =
            UI.create("page", parentView)
                .attr("enableScroll", true)
                /* Create the page's header */
                .facet("header",
                    UI.create("header")
                        .attr("title", title)
                        .facet("buttonsleft",
                            UI.create("buttongroup")
                                .addButton(UI.create("button")
                                    .attr("title", "Feeds")
                                    .attr("icon", "explore")
                                    .on('dom:' + Events.Touch.touchEndEventName, function () {
                                        pageNews.fire("aside:toggle");
                                    }))))

                /* Create the page's content */
                .facet("content",
                    UI.create("list")
                        /* Bind to an observable array. */
                        .items(news)
                        .template(itemTemplate)
                        .attr('style', 'normal')
                        .attr('empty', '<b>No news.</b><br><br>Please select a feed from the menu.')
                        .attr('sortable', false)
                        .on("item:clicked", function (eventName, item) {
                            pageNews.fire("news:clicked", item);
                            return true;
                        }));

        this.ui = pageNews;
        this.title = title;
        this.news = news;

        return this;
    }

    return NewsView;
});