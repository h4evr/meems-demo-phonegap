/*global define*/
define([
    "meems",
    "viewmodel/news",
    "server_conf"
], function (Meems, NewsViewModel, ServerConf) {
    var Utils = Meems.Utils;

    var dateFormat = "dd/MM/yyyy hh:mm:ss";

    var formatDate = function (date) {
        var d = date.getDate(),
            M = date.getMonth() + 1,
            y = date.getFullYear(),
            h = date.getHours(),
            m = date.getMinutes(),
            s = date.getSeconds();

        return dateFormat.replace("dd", d < 10 ? "0" + d.toString() : d.toString())
                         .replace("MM", M < 10 ? "0" + M.toString() : M.toString())
                         .replace("yyyy", y.toString())
                         .replace("hh", h < 10 ? "0" + h.toString() : h.toString())
                         .replace("mm", m < 10 ? "0" + m.toString() : m.toString())
                         .replace("ss", s < 10 ? "0" + s.toString() : s.toString())
                         .replace("d", d.toString()).replace("M", M.toString()).replace("yy", y.toString().substr(2))
                         .replace("h", h.toString()).replace("m", m.toString()).replace("s", s.toString());
    };

    return  {
        feeds: null,
        tempFeeds: null,

        newsCache: {},

        loadFeeds : function (cb) {
            Utils.Ajax.request({
                url: ServerConf.url + 'feeds',
                decoding: 'json',
                method: "GET",

                done: Utils.Fn.bind(function (resp) {
                    if (resp.statusCode === 200) {
                        this.feeds(resp.response);
                        if (cb) {
                            cb();
                        }
                    } else if (resp.statusCode === 403) {
                        this.parentController.navigateTo("login");
                    } else {
                        alert("An error occurred, please try again later.");
                    }
                }, this)
            });
        },

        saveFeeds : function (cb) {
            var feeds = this.feeds(),
                newFeeds = this.tempFeeds(),
                feed,
                pos, i, len;

            var feedsToAdd = [],
                feedsToRemove = [],
                feedsToUpdate = [];

            for (i = 0, len = feeds.length; i < len; ++i) {
                feed = feeds[i];
                pos = newFeeds.indexOf(feed);

                if (pos === -1) {
                    feedsToRemove.push(feed);
                }
            }

            for (i = 0, len = newFeeds.length; i < len; ++i) {
                feed = newFeeds[i];
                pos = feeds.indexOf(feed);

                if (pos === -1) {
                    feed.order = i;
                    feedsToAdd.push(feed);
                } else if (pos !== i) {
                    feed.order = i;
                    feedsToUpdate.push(feed);
                }
            }

            var removeFeeds = function (callback) {
                if (feedsToRemove.length == 0) {
                    callback();
                    return;
                }

                Utils.Ajax.request({
                    url: ServerConf.url + "feeds",
                    method: "DELETE",
                    format: "json",
                    params: feedsToRemove,
                    done: function (resp) {
                        if (resp.statusCode === 200) {
                            feedsToRemove = null;
                            callback();
                        }
                    }
                });
            };

            var updateFeeds = function (callback) {
                if (feedsToUpdate.length == 0) {
                    callback();
                    return;
                }

                Utils.Ajax.request({
                    url: ServerConf.url + "feeds",
                    method: "PUT",
                    format: "json",
                    params: feedsToUpdate,
                    done: function (resp) {
                        if (resp.statusCode === 200) {
                            feedsToUpdate = null;
                            callback();
                        }
                    }
                });
            };

            var addFeeds = function (callback) {
                if (feedsToAdd.length == 0) {
                    callback();
                    return;
                }

                Utils.Ajax.request({
                    url: ServerConf.url + "feeds",
                    method: "POST",
                    format: "json",
                    params: feedsToAdd,
                    done: function (resp) {
                        if (resp.statusCode === 200) {
                            feedsToAdd = null;
                            callback();
                        }
                    }
                });
            };

            var self = this;
            removeFeeds(function () {
                updateFeeds(function () {
                    addFeeds(function () {
                        self.loadFeeds(cb);
                    });
                });
            });

            this.tempFeeds([]);
        },

        getNewsFromFeed: function (feed, onDone) {
            var lastUpdate = window.localStorage["lastUpdate_" + feed._id] || "";
            window.localStorage["lastUpdate_" + feed._id] = new Date();

            Utils.Ajax.request({
                url: ServerConf.url + 'feeds/' + feed._id,
                decoding: 'json',
                method: "GET",
                params: {
                    "lastUpdate": lastUpdate
                },

                done: Utils.Fn.bind(function (resp) {
                    if (resp.statusCode === 200) {
                        var news = resp.response.news;

                        for (var i = 0, len = news.length; i < len; ++i) {
                            news[i].formattedDate = formatDate(new Date(news[i].date));
                        }

                        onDone(resp.response);
                    } else if (resp.statusCode === 403) {
                        this.parentController.navigateTo("login");
                    } else {
                        alert("An error occurred, please try again later.");
                    }
                }, this)
            });
        },

        refreshFeeds: function (onDone) {
            var self = this;
            var feeds = this.feeds();

            var refreshFeed = function (feed, i) {
                console.log("Synching " + feed.url);
                self.getNewsFromFeed(feed, function (resp) {
                    var feedCache = self.newsCache[resp.feed.url];

                    if (!feedCache) {
                        feedCache = self.newsCache[resp.feed.url] = {
                            title: resp.feed.name,
                            news: resp.news,
                            lastUpdateDate: new Date()
                        };
                    } else {
                        feedCache.news.unshift.apply(feedCache.news, resp.news);
                    }

                    window.localStorage.setItem("newsCache", JSON.stringify(self.newsCache));

                    if (i + 1 < feeds.length) {
                        Utils.Fn.postPone(function () { refreshFeed(feeds[i + 1], i + 1); });
                    } else {
                        onDone();
                    }
                });
            };

            if (feeds.length > 0) {
                refreshFeed(feeds[0], 0);
            }
        },

        parentController: null,
        view: null,
        init: function (parentController, view) {
            this.parentController = parentController;
            this.view = view || this.view;
            this.feeds = this.view.feeds;
            this.tempFeeds = this.view.tempFeeds;

            var self = this;

            var newsCacheStr = window.localStorage["newsCache"];

            if (!newsCacheStr) {
                this.newsCache = {};
            } else {
                this.newsCache = JSON.parse(newsCacheStr);
            }

            this.view.ui.on("feeds:clicked", function (eventName, feed) {
                var cache = self.newsCache[feed.url];

                if (cache && cache.news && cache.news.length > 0 &&
                    cache.lastUpdateDate && (new Date(cache.lastUpdateDate)).getTime() - (new Date()).getTime() < 300000 /*5min*/) {
                    NewsViewModel.showNews(feed, cache.news);
                    self.parentController.updateUi();
                }

                self.parentController.navigateTo("news");
            }).on("feeds:add", function (eventName, url) {
                self.tempFeeds.push({
                    name: url,
                    url: url
                });

                self.parentController.updateUi();
            }).on("feeds:manage", function (eventName, cb) {
                self.tempFeeds([]);
                self.tempFeeds.push.apply(self.tempFeeds, self.feeds());

                if (cb) {
                    cb(true);
                }
            }).on("feeds:save", function (eventName, cb) {
                self.saveFeeds(function () {
                    if (cb) {
                        cb(true);
                    }
                });
            }).on("feeds:cancel", function (eventName, cb) {
                self.tempFeeds([]);
                if (cb) {
                    cb(true);
                }
            }).on("feeds:refresh", function (eventName, cb) {
                self.refreshFeeds(function () {
                    if (cb) {
                        cb();
                    }
                });
            });
        }
    };
});