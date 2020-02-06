const { spawn } = require('child_process');

const _options = {
    stdio: 'inherit'
};
function terminal(cmd, options) {
    cmd = cmd.split(' ');
    let command = ['/c'].concat(cmd);
     Object.assign(_options, options);
    return new Promise((resolve, reject) => {
        try {
            let child = spawn('cmd', command, _options);
            let capture = '';
            if(child.stdout) {
                child.stdout.setEncoding('UTF-8');
                child.stdout.on("data", (data) => {
                    capture += data;
                });
            }
            child.on("exit",(code) => {
                if(code === 0) {
                    resolve(capture);
                }
                else {
                    reject(code);
                }
            });
        }
        catch(e) {
            reject(e);
        }
    });
};

const terminalSequence = (cmds, options) => {
    let captures = [];
    return new Promise((resolve, reject) => {
        try {
            (async (commands) => {
                for(let i = 0; i < commands.length; i++) {
                    console.log("executing " + commands[i]);
                    await terminal(commands[i], options).then((capture) => {
                        captures.push(capture);
                    }, reject)
                }
            })(cmds).then(() => {
                resolve(captures);
            }, reject);
        }
        catch(ex) {
            reject(ex);
        }

    })
};

exports.terminal = terminal;
exports.terminalSequence = terminalSequence;