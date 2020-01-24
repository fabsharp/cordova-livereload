const xml =  require('./config-xml');
const log = require('./log');
const { execSync } = require('child_process');
const { spawn } = require('child_process');
let app;

function executeCommands(cmd, cwd) {
    log.success(cmd.join(' '));
    let command = ['/c'].concat(cmd);
    return new Promise((resolve, reject) => {
        let child = spawn('cmd', command, {
            cwd : cwd,
            stdio: 'inherit'
        });
        child.on("exit",(code, signal) => {
            resolve();
        })
    });

    /**
    execSync(cmd, {
        cwd : cwd,
        stdio: 'inherit'
    }, (err) => {
        if(err) {
            log.error(err)
        }
    });**/

}
exports.start = function(options) {
    app = options.app;
    const LiveReloadServer = require('./LiveReloadServer');
    let server = new LiveReloadServer(options.ip, options.port, options.app);
    xml.rewrite(options.app, server.url).then(() => {
        if(options.devices) {
            executeCommands(['cordova', 'build', 'android']).then(() => {
                const map = async(devices) => {
                    for(const device of devices) {
                        let commands = options.commands.slice();
                        commands.push('--nobuild');
                        commands.push('--target='+ device);
                        await executeCommands(commands, options.app);
                    }
                };
                map(options.devices);
            });
        }
        else {
            executeCommands(options.commands, options.app);
        }
    });
};

exports.exit = function() {
    return xml.restore(app);
};