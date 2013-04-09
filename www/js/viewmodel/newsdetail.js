/*global define*/
define(function () {
    return  {
        news: {
            id: null,
            title: null,
            author: null,
            date: null,
            email: null,
            icon: null,
            body: null
        },

        showNewsDetails : function (news) {
            this.news = news;
            this.view.title(this.news.title);
            this.view.news(this.news);
        },

        view: null,
        parentController: null,
        init: function (parentController, view) {
            this.parentController = parentController;
            this.view = view || this.view;
            this.view.news(this.news);
        }
    };
});