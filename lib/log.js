const colors     = require('colors/safe');
exports.error = (err) => {
    if(err.message) {
        console.log(colors.red(err.message));
    }
    else {
        console.log(colors.red(err));
    }
    process.exit();
};

exports.success = (msg) => {
    console.log(colors.green(msg));
}