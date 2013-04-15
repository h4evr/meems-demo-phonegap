var Db = require('./db'),
    feedparser = require('feedparser'),
    db = null;

exports.get = function (req, res) {
    var email = req.session.email;

    db.collection('feeds', function (err, collection) {
        if (!err) {
            collection.find({'owner': email}).toArray(function (err, items) {
                res.send(err || items);
            });
        } else {
            console.error(err);
            res.send(err);
        }
    });
};

exports.subscribe = function (req, res) {
    var feed = req.body,
        email = req.session.email;

    getFeedMeta(feed.url, function (err, meta) {
        if (err)  {
            res.send(500, err);
        } else {
            feed.name = meta.title;
            feed.owner = email;

            db.collection('feeds', function (err, collection) {
                if (err) {
                    res.send(err);
                } else {
                    collection.insert(feed, { safe : true }, function (err, result) {
                        res.send(err || result[0]);
                    });
                }
            });
        }
    });
};

exports.update = function (req, res) {
    var id = req.params.id,
        feed = req.body,
        email = req.session.email;

    feed.owner = email;

    db.collection('feeds', function (err, collection) {
        if (err) {
            res.send(err);
        } else {
            collection.update({'_id' : new Db.BSON.ObjectID(id), 'owner' : email }, feed, { safe : true }, function (err) {
                res.send(err || feed);
            });
        }
    });
};

exports.remove = function (req, res) {
    var id = req.params.id,
        email = req.session.email;

    db.collection('feeds', function (err, collection) {
        if (err) {
            res.send(err);
        } else {
            collection.remove({'_id' : new Db.BSON.ObjectID(id), 'owner' : email }, { safe : true }, function (err) {
                res.send(err || req.body);
            });
        }
    });
};

exports.getFeedNews = function (req, res) {
    var email = req.session.email,
        id = req.params.id;

    db.collection('feeds', function (err, collection) {
        if (!err) {
            collection.findOne({'_id' : new Db.BSON.ObjectID(id), 'owner' : email }, function (err, feed) {
                if (err || !feed) {
                    res.send(500, err);
                } else {
                    updateFeed(feed, function (err, update, news)  {
                        if (err) {
                            res.send(500, err);
                            return;
                        }

                        if (update) {
                            collection.update({'_id' : feed._id}, feed, function (err) {
                                if (err) {
                                    console.log(err);
                                    res.send(500, err);
                                } else {
                                    res.send(news);
                                }
                            });
                        } else {
                            res.send(news);
                        }
                    });
                }
            });
        } else {
            console.error(err);
            res.send(err);
        }
    });
};

var getFeedMeta = function (url, cb) {
    var req = {
        uri: url
    };

    feedparser.parseUrl(req)
        .on('response', function (response) {
            if (response.statusCode !== 200) {
                cb({ 'err' : "Couldn't retrieve feed." });
            }
        })
        .on ('meta', function (meta) {
        cb(null, meta);
    });
};

var updateFeed = function (feed, cb) {
    var req = {
        uri: feed.url
    };

    if ("lastModifiedDate" in feed) {
        req.headers = req.headers || {};
        req.headers['If-Modified-Since'] = feed.lastModifiedDate;
    }

    if ("lastETag" in feed) {
        req.headers = req.headers || {};
        req.headers['If-None-Match'] = feed.lastETag;
    }

    var update = false;

    feedparser.parseUrl(req)
        .on('response', function (response) {
            if (response.statusCode === 200) {
                feed.lastModifiedDate = response.headers['last-modified'];
                feed.lastETag = response.headers['etag'];
                update = true;
            } else {
                update = false;

                if (response.statusCode === 304) {
                    cb(null, update, []);
                } else {
                    cb({ 'err' : "Couldn't retrieve feed.", 'statusCode': response.statusCode});
                }
            }
        })
        .on ('complete', function (meta, articles) {
            cb(null, update, articles, meta);
        });
};

/* START: Database initialization. */
Db.open(function (err, newDb) {
    if (err) {
        console.error(err);
    } else {
        console.log("connected to the database successfully.");
        db = newDb;

        db.collection('feeds', { strict: true }, function (err) {
            if (err) {
                populateDb();
            }
        });
    }
});

function populateDb() {
    var feeds = [
        {
            name: "Público",
            url: "http://feeds.feedburner.com/PublicoRSS",
            owner: "costa.h4evr@gmail.com"
        },
        {
            name: "RTP",
            url: "http://feeds.feedburner.com/PublicoRSS",
            owner: "sandrmagalhaes@gmail.com"
        }
    ];

    db.collection('feeds', function (err, collection) {
        collection.insert(feeds, { safe : true }, function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("populated database with dummy records.");
            }
        });
    });
}

/* END: Database initialization. */