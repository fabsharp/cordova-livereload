const convert = require('xml-js');
const fs = require('fs');
const format = require('xml-formatter');
const colors     = require('colors/safe');

exports.rewrite = function(app, server) {
    return new Promise((resolve, reject) => {
        try {
            console.log('reading config.xml...');
            let path = app + '/config.xml';
            let xml = fs.readFileSync(path, 'utf8');
            let json = convert.xml2json(xml);
            json = JSON.parse(json);
            config(json, server);
            fs.copyFile(path, app + '/config.autosaved-by-cordova-reload.xml', (err) => {
                if (err) {
                    console.log(colors.red(err.message));
                }
                console.log('original config.xml saved to config.autosaved-by-cordova-reload.xml');
                let newXML = convert.json2xml(json);
                newXML = format(newXML, {});
                fs.writeFileSync(app + '/config.xml', newXML);
                console.log(colors.green('config.xml updated'));
                resolve();
            });
        }
        catch(ex) {
            console.log(colors.red(ex.message));
            reject();
            process.exit();
        }
    })
};

// Should not be Async at all (call by before process.exit())
exports.restore = function(app) {
    let savedXml = app + '/config.autosaved-by-cordova-reload.xml';
    let original = app + '/config.xml';
    fs.copyFileSync(savedXml, original);
    fs.unlinkSync(savedXml);
    console.log("config.xml restored")
};

function config(json, server) {
    let widget;
    json.elements.forEach((element) => {
        if(element.name === 'widget') {
            widget = element;
        }
    });
    if(!widget) {
        console.error('ERROR no widget found in config.xml');
    }
// check android schema
    if(!widget.attributes['xmlns:android']) {
        widget.attributes['xmlns:android'] = "http://schemas.android.com/apk/res/android"
    }

    widget.elements.forEach((element) => {
        if(element.name === 'content') {
            element.attributes['src'] = server;
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