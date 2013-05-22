/*global define*/
define([ "meems" ], function(Meems) {
    var UI = Meems.UI, Events = Meems.Events, Obs = Meems.Observable;

    function NewsDetailView(parentView) {
        var pageTemplate =
            "<iframe class=\"news-details\" src=\"{{link}}\"></iframe>";

        var news = Obs.observable(),
            title = Obs.observable("Feed title"),
            pageDetail =
            UI.create("page", parentView)
                .attr("enableScroll", false)
                /* Create the page's header */
                .facet("header",
                    UI.create("header")
                        .attr("title", title)
                        .facet("buttonsleft",
                            UI.create("buttongroup")
                                .addButton(UI.create("button")
                                    .attr("title", "News")
                                    .attr("icon", "explore")
                                    .attr("action", "news"))
                                .on("button:pressed", function (eventName, btn) {
                                    switch(btn.attr('action')) {
                                        case 'news':
                                            // Unload frame
                                            news({
                                                link: "about:blank"
                                            });

                                            parentView.fire("goto:news");
                                            break;
                                    }
                                })))

                        /* Create the page's content */
                        .facet("content",
                            UI.create("html")
                                .attr("customClass", "ui-fill")
                                .attr("html", pageTemplate)
                                .attr("data", news));

        this.ui = pageDetail;
        this.title = title;
        this.news = news;

        return this;
    }

    return NewsDetailView;
});