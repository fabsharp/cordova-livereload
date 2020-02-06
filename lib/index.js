const xml =  require('./config-xml');
const log = require('./log');
const server = require('./server');
const android = require('./android');
/**
 * Current folder should be a cordova project
 * 1 / Get the port and the local ip ( validated before by the cli)
 * 2 / Edit config.xml
 * 3 / > cordova run build
 * 4 / Restore config.xml
 * 5 / Launch the server
 * 6 / For each selected emulator/device : > cordova emulate --nobuild target=device
 */
exports.launch = (ip, port, devices) => {
    try {
        server.run(ip, port);
    }
    catch(ex) {
        log.error(ex);
    }
    const url = `http://${ip}:${port}`;
    xml.rewrite(url).then(() => {
        android.build().then(() => {
            xml.restore();
            android.run(devices);
        }, log.error)
    }, log.error)
};

/**
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
}

exports.start = function(options) {
    app = options.app;
    const LiveReloadServer = require('./LiveReloadServer');
    let server = new LiveReloadServer(options.ip, options.port, options.app);
    xml.rewrite(options.app, server.url).then(() => {
        if(options.devices) {
            executeCommands(['cordova', 'build', 'android']).then(() => {
                const sequence = async(devices) => {
                    for(const device of devices) {
                        let commands = options.commands.slice();
                        commands.push('--nobuild');
                        commands.push('--target='+ device);
                        await executeCommands(commands, options.app);
                    }
                };
                sequence(options.devices);
            });
        }
        else {
            executeCommands(options.commands, options.app);
        }
    });
};

exports.exit = function() {
    return xml.restore(app);
};**/