/*global define*/
define([
    "meems", "viewmodel/login", "viewmodel/feeds", "viewmodel/news", "viewmodel/newsdetail"
], function (Meems, LoginViewModel, FeedsViewModel, NewsViewModel, NewsDetailsViewModel) {
    var Utils = Meems.Utils;

    var PhoneViewModel = {
        navigateTo : function (page) {
            if (page === 'details') {
                this.view.pageHolder.currentPage(this.view.pageDetails.ui);
            } else if (page === 'news') {
                this.view.pageHolder.currentPage(this.view.pageNews.ui);
            } else if (page === 'login') {
                this.view.masterPageHolder.currentPage(this.view.pageLogin.ui);
            } else if (page === 'main') {
                FeedsViewModel.loadFeeds(Utils.Fn.bind(function () {
                    this.view.masterPageHolder.currentPage(this.view.phoneUi);
                    Utils.Dom.applyChanges();
                }, this));
            }

            Utils.Dom.applyChanges();
        },

        updateUi : function () {
            Utils.Dom.applyChanges();
        },

        view : null,
        init : function (view) {
            this.view = view || this.view;

            LoginViewModel.init(this, this.view.pageLogin);
            FeedsViewModel.init(this, this.view.pageFeeds);
            NewsViewModel.init(this, this.view.pageNews);
            NewsDetailsViewModel.init(this, this.view.pageDetails);

            var self = this, pageHolder = this.view.pageHolder;

            pageHolder.on("goto:news", function() {
                self.navigateTo("news");
            });

            pageHolder.on("goto:details", function() {
                self.navigateTo("details");
            });
        }
    };

    return PhoneViewModel;
});