'use strict';

const exec = require('child_process').exec;
const Path = require('path');
const valid_command = path => 'DAEValidator "' + path + '"';

module.exports = path => new Promise((resolve, reject) => {
    path = Path.normalize(path);
    exec(valid_command(path), (error, stdout, stderr) => {
        if (error || stderr) {
            reject(error || stderr);
        }
        resolve();
    });
});
