var express = require('express'),
    user = require('./user'),
    feeds = require('./feeds'),
    app = express();

var allowCrossDomain = function (req, res, next) {
    "use strict";
    res.header("Access-Control-Allow-Origin", req.header("Origin"));
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Credentials", "true");

    next();
};

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.cookieSession({
    secret: 'ma-secret'
}));
app.use(allowCrossDomain);

/*
 * Respond to OPTIONS (HTTP Access Control)
 */
app.options("/*", function (req, res, next) {
    "use strict";
    res.send(200);
});

/*
 * Login a user
 * Route: /user/login.
 * Method: POST
 * Expects JSON object with:
 * email - The email of the user to login,
 * password - The password of the user.
 */
app.post('/user/login', user.login);

/*
 * Create a new user account.
 * Route: /user
 * Method: POST
 * Expects JSON object with:
 * email - The email of the user.,
 * password - The password of the user.
 * name (optional) - The name of the user.
 */
app.post('/user', user.signUp);

/*
 * Update an user account.
 * Route: /user
 * Method: PUT
 * Expects JSON object with:
 * email - The email of the user.,
 * password (optional) - The password of the user.
 * name (optional) - The name of the user.
 */
app.put('/user', user.protect(user.update));

/*
 * Get user account of the currently logged user.
 * Route: /user
 * Method: GET
 */
app.get('/user', user.protect(user.get));

/*
 * Returns all the feeds of the logged user.
 * Route: /feeds
 * Method: GET
 */
app.get("/feeds", user.protect(feeds.get));

/*
 * Adds a new feeds.
 * Route: /feeds
 * Method: POST
 * Expects JSON object with:
 * url - The URL of the RSS feed.
 */
app.post("/feeds", user.protect(feeds.subscribe));

/*
 * Updates a feed.
 * Route: /feeds/:id
 * Method: PUT
 * Expects JSON object with:
 * id - ID of the feed to update.
 * url - The URL of the RSS feed.
 * name - The name of the feed.
 */
app.put("/feeds/:id", user.protect(feeds.update));

/*
 * Remove a feeds.
 * Route: /feeds/:id
 * Method: DELETE
 * Expects JSON object with:
 * id - ID of the feed to delete.
 */
app.delete("/feeds/:id", user.protect(feeds.remove));

/*
 * Returns the latest news since last invocation.
 * Route: /feeds/:id
 * Method: GET
 * Expects JSON object with:
 * id - The ID of the RSS feed to fetch news of.
 */
app.get("/feeds/:id", user.protect(feeds.getFeedNews));


app.listen(9999);
console.log("Listening on port 9999...");
