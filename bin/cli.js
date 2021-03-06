#!/usr/bin/env node
'use strict';

const inquirer = require('inquirer');
const log = require('../lib/log');
let argv = require('minimist')(process.argv.slice(2));
const ip = require('ip');
const server = require("../lib/index");
const fs = require('fs');
const android = require('../lib/android')

process.title = 'cordova-livereload';
let version = require('../package.json').version;
let help = `
cordova-livereload v${version}
===========================================================
usage : 
    cordova-livereload [livereload-options] <path-to-cordova-app
    cordova-livereload [livereload-options] cordova command [cordova-options]
[livereload-options] :
    -h --help          Print this list and exit.
    -v --version       Print the version and exit. 
    -p --port          Port to use (default : 3000)   
    -l --list-devices  Choose a device or emulator to livereload
# <path-to-cordova-app>
    Path to a valid cordova app [default : .]
# cordova command [cordova-options]`;

if (argv.h || argv.help) {
    console.log(help);
    process.exit();
}

if (argv.v || argv.version) {
    console.log(version);
    process.exit();
}

const process_exit = () => {
    log.error('cordova-livereload stopped');
};

if (process.platform === 'win32') {
    require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    }).on('SIGINT', process_exit);
}

process.on('SIGINT', process_exit);

process.on('SIGTERM', process_exit);

const isCordovaApp = (folder) => new Promise((resolve, reject) => {
    fs.access(folder + '/config.xml', fs.F_OK, (err) => {
        if (err) {
            reject(err)
        }
        //file exists
        resolve();
    })
});

const _getPort = () => {
    if(argv.p || argv.port) {
        let port = argv.p || argv.port
        return Promise.resolve(port);
    }
    else {
        const getPort = require('get-port');
        return getPort({port: 3000});
    }
};

isCordovaApp('.').then(() => {
    _getPort().then((port) => {
        if(argv.l || argv['list-device']) {
            let choices = [];
            android.listEmulators().then((emulators) => {
                choices = choices.concat(emulators);
                android.listDevices().then((devices) => {
                    choices = choices.concat(devices);
                    inquirer.prompt([
                        {
                            type : "checkbox",
                            name : 'targets',
                            message : "What devices to livereload ?",
                            choices : choices
                        }
                    ]).then(responses => {
                        server.launch(ip.address(), port, responses.targets);
                    })
                })
            })
        }
        else {
            server.launch(ip.address(), port);
        }
    }, log.error);
}, log.error);

/**
function _promptDevice() {
    return new Promise((resolve, reject) => {
        if(argv.l || argv['list-device']) {
            let targets = [];
            let androidEmulators = execSync('emulator -list-avds', {
                cwd : cordovaApp
            }, (err) => {
                log.error('Android emulator not found.')
            });
            androidEmulators = androidEmulators.toString();
            if(androidEmulators) {
                let split = androidEmulators.split('\r\n');
                split.forEach((item) => {
                    if(item) {
                        targets.push(item);
                    }
                })
            }
            let androidDevices = execSync('adb devices', {
                cwd : cordovaApp
            });
            androidDevices = androidDevices.toString();
            let split = androidDevices.split('\n');
            for(let i = 1; i < split.length; i++) {
                let device = split[i].split('\t')[0];
                device = device.replace('\r', '');
                if(device) {
                    targets.push(device);
                }
            }
            inquirer.prompt([
                {
                    type : "checkbox",
                    name : 'targets',
                    message : "What devices to livereload ?",
                    choices : targets
                }
            ]).then(responses => {
                resolve(responses.targets);
            });
        }
        else {
            resolve();
        }
    })
}

_getPort().then((port) => {
    _promptDevice().then((devices) => {
        server.launch(ip.address(), port, devices);
    });
});**/


