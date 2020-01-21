#!/usr/bin/env node
'use strict';

const colors     = require('colors/safe');
let argv = require('minimist')(process.argv.slice(2));

process.title = 'cordova-livereload';

let version = require('../package.json').version;
let help = `
cordova-livereload v${version}
===========================================================
usage : cordova-livereload [options] <path-to-cordova-app>
[options] :
    -h --help          Print this list and exit.
    -v --version       Print the version and exit.
# configuration    
    -p --port          Port to use (default : 3000)   
    --android
    --ios   
<path-to-cordova-app>
    Path to a valid cordova app [default : .]`;


if (argv.h || argv.help) {
    console.log(help);
    process.exit();
}

if (argv.v || argv.version) {
    console.log(version);
    process.exit();
}

const isPortAvailable = (port) => new Promise((resolve, reject) => {
    const net = require('net');
    const tester = net.createServer()
        .once('error', err => reject(err))
        .once('listening', () => tester.once('close', () => resolve()).close())
        .listen(port);
});

const fs = require('fs');
const isCordovaApp = (folder) => new Promise((resolve, reject) => {
    fs.access(folder + '/config.xml', fs.F_OK, (err) => {
        if (err) {
            reject(err)
        }
        //file exists
        resolve();
    })
});

const logError = (err) => {
    if(err.message) {
        console.log(colors.red(err.message));
    }
    else {
        console.log(colors.red(err));
    }
    process.exit();
};

const ip = require('ip');
const server = require("../lib/index");

const process_exit = () => {
    server.exit();
    logError('cordova-livereload stopped');
};

if (process.platform === 'win32') {
    require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    }).on('SIGINT', process_exit);
}

process.on('SIGINT', process_exit);

process.on('SIGTERM', process_exit);

let port = argv.p || argv.port || 3000;
let cordovaApp =  argv._[0] || '.';
isCordovaApp(cordovaApp).then(() => {
    isPortAvailable(port).then(() => {
        server.start({
            port : port,
            app : cordovaApp,
            ip : ip.address()
        })
    }, logError);
}, (err) => {
    console.log(colors.red(`${cordovaApp} is not a valid cordova application : https://cordova.apache.org/#getstarted`));
    logError(err);
});