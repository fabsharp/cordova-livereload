const {terminal, terminalSequence} = require('./terminal');
const {log} = require('./log');

exports.build = () => {
    return terminal('cordova build android');
};

exports.run = (devices = null) => {
    if(!devices) {
        return terminal('cordova run android --nobuild');
    }
    else {
        let commands = [];
        if(Array.isArray(devices)) {
            devices.forEach(device => {
                commands.push(`cordova run android --nobuild target=${device}`);
            })
        }
        else {
            commands.push(`cordova run android --nobuild target=${devices}`);
        }
        return terminalSequence(commands).then(() => {
            log.success("launching emulators")
        }, (ex) => {
            console.log(ex);
            log.error(ex);
        });
    }
};

exports.listEmulators = () => {
    return terminal('emulator -list-avds', {
        stdio : 'pipe'
    }).then(stdout => {
        if(stdout) {
            let targets = [];
            let split = stdout.split('\r\n');
            split.forEach((item) => {
                if(item) {
                    targets.push(item);
                }
            });
            return targets;
        }
        else {
           return [];
        }
    });
};

exports.listDevices = () => {
    return terminal('adb devices').then(stdout => {
        if(stdout) {
            let split = stdout.split('\n');
            let targets = [];
            for(let i = 1; i < split.length; i++) {
                let device = split[i].split('\t')[0];
                device = device.replace('\r', '');
                if(device) {
                    targets.push(device);
                }
            }
            return targets;
        }
        else {
            return [];
        }
    })
};