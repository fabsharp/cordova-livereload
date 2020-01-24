const xml =  require('./config-xml');
const log = require('./log')
let app;
exports.start = function(options) {
    app = options.app;
    const LiveReloadServer = require('./LiveReloadServer');
    let server = new LiveReloadServer(options.ip, options.port, options.app);
    xml.rewrite(options.app, server.url).then(() => {
        const { execSync } = require('child_process');
        if(options.commands) {
            let command = options.commands.join(' ');
            log.success(command);
            execSync(command, {
                cwd : options.app,
                stdio: 'inherit'
            }, (err) => {
                if(err) {
                    log.error(err)
                }
            });
        }
        else {
            execSync('cordova emulate android', {
                cwd : options.app,
                stdio: 'inherit'
            }, function(err) {
                if(err) {
                    log.error(err);
                }
            });
        }
    });
};

exports.exit = function() {
    return xml.restore(app);
};