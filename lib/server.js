const fs = require('fs');
const ip = require('ip');
const cheerio = require('cheerio');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const chokidar = require('chokidar');
const { execSync } = require('child_process');
const colors = require('colors/safe');
let url;
let _options;
exports.start = function(options) {
    _options = options;
    server.listen(options.port, () => {
        url = 'http://' + ip.address() + ':' + options.port;

        app.use((req, res, next) => {
            console.log(req.method, req.originalUrl);
            next();
        });

        app.get('/', (req, res, next) => {
            var html = fs.readFileSync(options.app + '/www/index.html', 'utf8');
            var $ = cheerio.load(html);
            $('body').append('<script src="/socket.io/socket.io.js"></script>');
            $('body').append('<script src="/livereload-client.js"></script>');
            res.send($.html());
        });

        app.get('/livereload-client.js', (req, res, next) => {
            res.send('var socket = io.connect();\n' +
                'socket.on("refresh", function() {\n' +
                '    document.location.reload(true);\n' +
                '});');
        });

        app.use(express.static(options.app + '/www'));
        app.use(express.static(options.app + '/platforms/android/platform_www'));

        io.on('connection', function(socket){
            console.log(colors.green('livereload ready. Every change in ' + options.app + '/www will refresh the app.'));
            socket.on('disconnect', function(){
                console.log('disconnected');
            });
        });

        chokidar.watch(options.app + '/www', { ignoreInitial : true}).on('change', (event, path) => {
            //console.log(event, path);
            console.log("sending refresh event")
            io.emit('refresh');
        });

        require('./config-xml').rewrite(options.app, url).then(() => {
            console.log('server started ' + url);
            console.log('launching emulator...');
            try {
                execSync('cordova emulate android', {
                    cwd : options.app,
                    stdio: 'inherit'
                }, function(err) {
                    if(err) {
                        throw err;
                    }
                });
            }
            catch {
                process.exit();
            }
            console.log(colors.green("emulator is running"));
        });
    });
};

exports.exit = function() {
    return require('./config-xml').restore(_options.app);
};