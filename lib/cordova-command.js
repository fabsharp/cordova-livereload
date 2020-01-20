const { execSync } = require('child_process');
const colors = require('colors/safe');
exports.launch = function(app) {
    console.log(colors.green('cordova emulate android'));
    try {
        execSync('cordova emulate android', {
            cwd : app,
            stdio: 'inherit'
        }, function(err) {
            if(err) {
                console.log(colors.red(err));
                process.exit();
            }
        });
        console.log(colors.green("emulator is running"));
    }
    catch {
        process.exit();
    }
}