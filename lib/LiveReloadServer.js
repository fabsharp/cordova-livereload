const http = require('http');
const express = require('express');
const io = require('socket.io');
const fs = require('fs');
const cheerio = require('cheerio');
const watch = require('node-watch');
const colors = require('colors/safe');

class LiveReloadServer {
    constructor(ip, port, app) {
        this.ip = ip;
        this.port = port;
        this.app = app;
        this.express = express();
        this.server = http.createServer(this.express);
        this.io = io.listen(this.server);
        this._start();
    }
    get url() {
        return 'http://' + this.ip + ':' + this.port;
    }
    _start() {
        this.server.listen(this.port, () => {
            this._startHttp();
            this._startSocket();
            console.log(colors.green('livereload server started at ' + this.url))
        });
    }
    _startHttp() {
        this.express.use((req, res, next) => {
            console.log(colors.blue(req.method + ' ' + req.originalUrl));
            next();
        });
        this.express.get('/', (req, res) => {
            let html = fs.readFileSync(this.app + '/www/index.html', 'utf8');
            let $ = cheerio.load(html);
            $('body').append('<script src="/socket.io/socket.io.js"></script>');
            $('body').append('<script src="/livereload-client.js"></script>');
            res.send($.html());
        });

        this.express.get('/livereload-client.js', (req, res) => {
            res.send('var socket = io.connect();\n' +
                'socket.on("refresh", function() {\n' +
                '    document.location.reload(true);\n' +
                '});');
        });
        this.express.use(express.static(this.app + '/www'));
        this.express.use(express.static(this.app + '/platforms/android/platform_www'));
        this.express.use((req, res, next) => {
            console.log(colors.red(req.method + ' ' + req.originalUrl));
            res.status(404);
            next();
        })
    }
    _startSocket() {
        this.io.on('connection', function(socket){
            console.log(colors.green('livereload ready'));
            socket.on('disconnect', function(){
                console.log('disconnected');
            });
        });

        watch(this.app + '/www', (evt, filename) => {
           if(evt === 'update') {
               console.log("sending refresh event")
               this.io.emit('refresh');
           }
        });
    }
}

module['exports'] = LiveReloadServer;