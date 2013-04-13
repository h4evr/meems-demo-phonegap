var mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('ds039427.mongolab.com', 39427, { auto_reconnect: true }),
    db = new Db('rssreader', server, { w: 1}),
    user = 'rssreader',
    pass = 'rssreader123',
    status = 0,
    callbacks = [];

function openDb(cb) {
    if (status === 2) {
        cb(null, db);
    } else if (status === 1) {
        callbacks.push(cb);
    } else {
        status = 1;
        callbacks.push(cb);

        db.open(function (err, db) {
            if (!err) {
                db.authenticate(user, pass, function (err, result) {
                    status = 2;

                    if (!err && result === true) {
                        invokeCallbacks(null, db);
                    } else {
                        invokeCallbacks(err, db);
                    }
                })
            } else {
                cb(err, null);
            }
        });
    }
}

function invokeCallbacks(err, db) {
    for (var i = 0, ln = callbacks.length; i < ln; ++i) {
        callbacks[i](err, db);
    }
}

exports.open = openDb;
exports.BSON = BSON;