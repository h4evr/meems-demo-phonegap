({
    baseUrl: "../www",
    paths: {
        "meems": "./js/lib/meems.min",
        "view": "./js/view",
        "viewmodel": "./js/viewmodel",
        "server_conf": "./js/server_conf"
    },
    name: "../tools/almond",
    out: "../www/js/index.min.js",
    optimize: "uglify2",
    include: [ "js/index" ],
    wrap: {
        startFile: "../tools/start.frag",
        endFile: "../tools/end.frag"
    }
})
