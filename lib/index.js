const colors = require('colors/safe');
const xml =  require('./config-xml');
const { launch } = require('./cordova-command');

let app;
exports.start = function(options) {
    app = options.app;
    const LiveReloadServer = require('./LiveReloadServer');
    let server = new LiveReloadServer(options.ip, options.port, options.app);
    xml.rewrite(options.app, server.url).then(() => {
        launch(options.app);
    });
};

exports.exit = function() {
    return xml.restore(app);
};