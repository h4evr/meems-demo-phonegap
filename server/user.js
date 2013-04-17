var Db = require('./db'),
    crypto = require('crypto'),
    db = null;

exports.signUp = function (req, res) {
    var newUser = req.body,
        email = req.body.email;

    if (!("email" in newUser && "password" in newUser)) {
        res.send(400, "Missing parameters, must send email and password.");
        return;
    }

    // Encrypt password before saving.
    var shasum = crypto.createHash('sha1');
    shasum.update(newUser.password);
    newUser.password = shasum.digest('hex');

    db.collection('users', function (err, collection) {
        if (err) {
            res.send(500, err);
        } else {
            collection.findOne({ "email": email }, function (err) {
                if (err) {
                    collection.insert(newUser, function (err, result) {
                        if (err) {
                            res.send(500, err);
                        } else {
                            res.send(result);
                        }
                    });
                } else {
                    res.send(400, "User already exists.");
                }
            });
        }
    });
};

exports.get = function (req, res) {
    var email = req.session.email;

    if (!email) {
        res.send(403, "Must login first.");
        return;
    }

    db.collection('users', function (err, collection) {
        if (err) {
            res.send(500, err);
        } else {
            collection.findOne({ "email": email }, function (err, user) {
                if (err) {
                    res.send(500, err);
                } else {
                    delete user.password;
                    res.send(user);
                }
            });
        }
    });
};

exports.update = function (req, res) {
    var email = req.session.email,
        newUser = req.body;

    // Encrypt password before saving.
    if ("password" in newUser) {
        var shasum = crypto.createHash('sha1');
        shasum.update(newUser.password);
        newUser.password = shasum.digest('hex');
    }

    db.collection('users', function (err, collection) {
        if (err) {
            res.send(500, err);
        } else {
            collection.findOne({ "email": email }, function (err, user) {
                if (err) {
                    res.send(500, err);
                } else {
                    user.name = newUser.name || user.name;
                    user.password = newUser.password || user.password;

                    collection.update({'_id' : user._id}, user, function (err, result) {
                        if (err) {
                            res.send(500, err);
                        } else {
                            res.send(result);
                        }
                    });
                }
            });
        }
    });
};

exports.login = function (req, res) {
    var email = req.body.email,
        password = req.body.password;

    var shasum = crypto.createHash('sha1');
    shasum.update(password);
    var pass = shasum.digest('hex');

    db.collection('users', function (err, collection) {
        if (err) {
            res.send(500, err);
        } else {
            collection.findOne({ "email": email }, function (err, user) {
                if (err) {
                    res.send(500, err);
                } else if (user) {
                    if (user.password === pass) {
                        req.session.email = email;
                        res.send({email: email});
                    } else {
                        res.send(403, {err: "Bad authentication"});
                    }
                } else {
                    res.send(403, {err: "Bad authentication"});
                }
            });
        }
    });
};

exports.protect = function (func) {
    return function (req, res) {
        var session = req.session;

        if (!session || !session.email) {
            res.send(403, "Please login first.");
        } else {
            func(req, res);
        }
    };
};

/* START: Database initialization. */

Db.open(function (err, newDb) {
    if (err) {
        console.error(err);
    } else {
        db = newDb;

        db.collection('users', { strict: true }, function (err) {
            if (err) {
                db.collection('users', function (err, collection) {
                    var shasum = crypto.createHash('sha1');
                    shasum.update('qwerty');
                    var pass = shasum.digest('hex');

                    var users = [
                        {
                            "name": "Diogo Costa",
                            "email": "costa.h4evr@gmail.com",
                            "password": pass
                        },
                        {
                            "name": "Sandra Magalhães",
                            "email": "sandrmagalhaes@gmail.com",
                            "password": pass
                        }
                    ];

                    console.log("inserting dummy users...");
                    collection.insert(users, { safe: true }, function (err) {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log("done.");
                        }
                    });
                });
            }
        });
    }
});

/* END: Database initialization. */