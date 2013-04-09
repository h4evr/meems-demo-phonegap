/*global define*/
define([
    "viewmodel/news"
], function (NewsViewModel) {
    var $feedsLoading = {};

    return  {
        feeds: null,

        newsCache: {},

        loadFeeds : function() {
            if (window.localStorage) {
                var feedList = window.localStorage.getItem("feeds");
                if (feedList) {
                    this.feeds(JSON.parse(feedList));
                } else {
                    this.feeds([]);
                }
            }
        },

        saveFeeds : function() {
            if (window.localStorage) {
                var feedList = JSON.stringify(this.feeds());
                window.localStorage.setItem("feeds", feedList);
            }
        },

        onFeedLoad: function (data) {
            var url = data.query.meta.url.id || '';

            if ($feedsLoading[url] !== undefined) {
                var feedName = data.query.results.feed.title;
                var lastUpdateDate = data.query.results.feed.date;
                var news = data.query.results.feed.entry;

                var callback = $feedsLoading[url];
                $feedsLoading[url] = null;
                if (callback) {
                    setTimeout(function () {
                        callback(url, lastUpdateDate, news, feedName);
                    }, 0);
                }
            } else {
                console.warn("[onFeedLoad] Received feed info but there is no one to collect! " + url);
            }
        },

        getNewsFromFeed: function (feed, onDone) {
            var yqlUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feednormalizer%20where%20url%3D'"
                       + encodeURIComponent(feed.url) + "'%20and%20output%3D'atom_1.0'&format=json&diagnostics=true&callback=onFeedLoad";

            $feedsLoading[feed.url] = onDone;

            var script = document.createElement("script");
            script.src = yqlUrl;
            document.getElementsByTagName("head")[0].appendChild(script);
        },

        parentController: null,
        view: null,
        init: function (parentController, view) {
            this.parentController = parentController;
            this.view = view || this.view;
            this.feeds = this.view.feeds;

            var self = this;

            this.view.ui.on("feeds:clicked", function (eventName, feed) {
                var cache = self.newsCache[feed.url];

                if (cache && cache.news && cache.news.length > 0 &&
                    cache.lastUpdateDate && cache.lastUpdateDate.getTime() - (new Date()).getTime() < 300000 /*5min*/) {
                    NewsViewModel.showNews(feed, cache.news);
                } else {
                    self.getNewsFromFeed(feed, function (url, lastUpdateDate, news, title) {
                        self.newsCache[feed.url] = {
                            title: title,
                            news: news,
                            lastUpdateDate: new Date(lastUpdateDate)
                        };

                        NewsViewModel.showNews(feed, news);

                        self.parentController.updateUi();
                    });
                }

                self.parentController.navigateTo("news");
            }).on("feeds:add", function (eventName, url) {
                var onDone = function (url, lastUpdateDate, news, title) {
                    self.feeds.push({
                        id: Math.random() * 1000000.0,
                        title: title,
                        url: url,
                        unread: 0,
                        read: {}
                    });

                    if (news && lastUpdateDate) {
                        self.newsCache[url] = {
                            title: title,
                            news: news,
                            lastUpdateDate: new Date(lastUpdateDate)
                        };
                    }

                    self.parentController.updateUi();
                };

                var cache = self.newsCache[url];

                if (cache && cache.news && cache.news.length > 0) {
                    onDone(url, null, null, cache.title);
                } else {
                    self.getNewsFromFeed({ url: url }, onDone);
                }
            });

            this.loadFeeds();

            if (this.feeds().length == 0) {
                this.feeds([
                    {
                        id: 1,
                        title: "Público",
                        url: "http://feeds.feedburner.com/PublicoRSS",
                        unread: 0,
                        read: {}
                    },
                    {
                        id: 2,
                        title: "RTP Notícias / Geral / Últimas",
                        url: "http://www.rtp.pt/noticias/index.php?headline=204&visual=58",
                        unread: 0,
                        read: {}
                    }
                ]);
            }

            var self = this;
            this.feeds.subscribe(function () {
                self.saveFeeds();
            });

            window.onFeedLoad = this.onFeedLoad;
        }
    };
});