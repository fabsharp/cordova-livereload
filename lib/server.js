const http = require('http');
const express = require('express');
const io = require('socket.io');
const fs = require('fs');
const cheerio = require('cheerio');
const watch = require('node-watch');
const colors = require('colors/safe');

exports.run = (ip, port) => {
    const _express = express();
    const _server = http.createServer(_express);
    const _io = io.listen(_server);
    _server.listen(port, () => {
        _express.use((req, res, next) => {
            console.log(colors.blue(req.method + ' ' + req.originalUrl));
            next();
        });
        _express.get('/', (req, res) => {
            let html = fs.readFileSync('./www/index.html', 'utf8');
            let $ = cheerio.load(html);
            $('body').append(`
<!-- injected by cordova-livereload -->
<script src="/socket.io/socket.io.js"></script>
<script src="/livereload-client.js"></script>
<!-- /end inject -->`);
            res.send($.html());
        });

        _express.get('/livereload-client.js', (req, res) => {
            res.send( `
// injected by cordova-livereload
var socket = io.connect();
socket.on("refresh", function() {
    document.location.reload(true);
});`);
        });
        _express.use(express.static('./www'));
        _express.use(express.static('./platforms/android/platform_www'));
        _io.on('connection', function(socket){
            console.log(colors.green('livereload ready'));
            socket.on('disconnect', function(){
                console.log('disconnected');
            });
        });
        console.log("linked ?")
        watch('./www', { recursive: true }, (evt, filename) => {
            if(evt === 'update') {
                console.log("sending refresh event")
                _io.emit('refresh');
            }
        });
    });
};