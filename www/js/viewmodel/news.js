/*global define*/
define([
    "viewmodel/newsdetail"
], function (NewsDetailViewModel) {
    return  {
        news: [],

        showNews : function (feed, news) {
            this.news = news;
            this.view.title(feed.title);
            this.view.news(this.news);
        },

        parentController: null,
        view: null,
        init: function (parentController, view) {
            this.parentController = parentController;
            this.view = view || this.view;

            var self = this;

            this.view.ui.on("news:clicked", function (eventName, news) {
                NewsDetailViewModel.showNewsDetails(news);
                self.parentController.navigateTo("details");
            });

            this.view.news(this.news);
        }
    };
});