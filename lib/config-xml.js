const convert = require('xml-js');
const fs = require('fs');
const log = require('./log');
const format = require('xml-formatter');

exports.rewrite = function(url) {
    return new Promise((resolve, reject) => {
        try {
            console.log('reading config.xml...');
            let path ='./config.xml';
            let xml;
            try {
                xml = fs.readFileSync(path, 'utf8');
            }
            catch(ex){
                const path = require("path");
                let targetDirectory = path.resolve(process.cwd());
                log.error(`${targetDirectory} is not a Cordova-based project.`);
            }

            let json = convert.xml2json(xml);
            json = JSON.parse(json);
            config(json, url);
            fs.copyFile(path, './config.autosaved-by-cordova-reload.xml', (err) => {
                if (err) {
                    log.error(err.message);
                }
                console.log('original config.xml saved to config.autosaved-by-cordova-reload.xml');
                let newXML = convert.json2xml(json);
                newXML = format(newXML, {});
                fs.writeFileSync('./config.xml', newXML);
                log.success('config.xml updated');
                resolve();
            });
        }
        catch(ex) {
            reject();
            log.error(ex.message);
        }
    })
};

// Should not be Async at all (call by before process.exit())
exports.restore = function() {
    let savedXml = './config.autosaved-by-cordova-reload.xml';
    let original = './config.xml';
    fs.copyFileSync(savedXml, original);
    fs.unlinkSync(savedXml);
    log.success("config.xml restored")
};

function config(json, url) {
    let widget;
    json.elements.forEach((element) => {
        if(element.name === 'widget') {
            widget = element;
        }
    });
    if(!widget) {
        log.error('ERROR no widget found in config.xml');
    }
// check android schema
    if(!widget.attributes['xmlns:android']) {
        widget.attributes['xmlns:android'] = "http://schemas.android.com/apk/res/android"
    }

    widget.elements.forEach((element) => {
        if(element.name === 'content') {
            element.attributes['src'] = url;
        }
        if(element.name === 'platform' && element.attributes.name === 'android') {
            let editConfig;
            element.elements.forEach((_element) => {
                if(_element.name === 'edit-config' && _element.attributes["file"] === "app/src/main/AndroidManifest.xml") {
                    editConfig = _element;
                }
            });
            let done = false;
            if(editConfig) {
                if(editConfig.elements) {
                    editConfig.elements.forEach((_element) => {
                        if(_element.name === 'application' && _element.attributes['android:usesCleartextTraffic']) {
                            _element.attributes['android:usesCleartextTraffic'] = "true";
                            done = true;
                        }
                    });
                    if(!done) {
                        editConfig.elements.push({
                            type : "element",
                            name : "application",
                            attributes : {
                                'android:usesCleartextTraffic' : "true"
                            }
                        });
                        done = true;
                    }
                }
                else {
                    editConfig.elements = [
                        {
                            type : 'element',
                            name : 'application',
                            attributes : {
                                'android:usesCleartextTraffic' : "true"
                            }
                        }
                    ];
                    done = true;
                }
            }
            if(!done) {
                element.elements.push({
                    type : 'element',
                    name : 'edit-config',
                    attributes : {
                        "file" :  "app/src/main/AndroidManifest.xml",
                        "mode" : "merge",
                        "target" : "/manifest/application"
                    },
                    elements : [{
                        type : 'element',
                        name : 'application',
                        attributes : {
                            'android:usesCleartextTraffic' : 'true'
                        }
                    }]
                })
            }
        }
    });
}