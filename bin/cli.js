#!/usr/bin/env node
'use strict';

const colors     = require('colors/safe');
let argv = require('minimist')(process.argv.slice(2));

process.title = 'cordova-livereload';

let version = require('../package.json').version
if (argv.h || argv.help) {
    console.log([
        '',
        'cordova-livereload v' + version,
        '==========================================================',
        'usage: cordova-livereload [options] <path-to-cordova-app>',
        '',
        'options:',
        '  -p --port          Port to use [3000]',
        '  -h --help          Print this list and exit.',
        '  -v --version       Print the version and exit.'
    ].join('\n'));
    process.exit();
}

if (argv.v || argv.version) {
    console.log(version);
    process.exit();
}

let port = argv.p || argv.port || 3000;


let liveReload = require('../lib/index');
liveReload.start({
    port : port,
    app : argv._[0] || '.'
});

if (process.platform === 'win32') {
    require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    }).on('SIGINT', function () {
        process.emit('SIGINT');
    });
}

process.on('SIGINT', function () {
    liveReload.exit().then(() => {
        console.log(colors.red('cordova-livereload stopped.'));
        process.exit();
    }, () => {
        process.exit();
    })

});

process.on('SIGTERM', function () {
    liveReload.exit().then(() => {
        console.log(colors.red('cordova-livereload stopped.'));
        process.exit();
    }, () => {
        process.exit();
    })
});