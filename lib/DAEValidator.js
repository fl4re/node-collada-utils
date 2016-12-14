'use strict';

const exec = require('child_process').exec;
const Path = require('path').posix;
const valid_command = path => 'DAEValidator ' + path;
const cwd = Path.join(__dirname, '../bin/');

module.exports = path => new Promise((resolve, reject) => {
    exec(valid_command(path), { cwd: cwd }, (error, stdout, stderr) => {
        if (error || stderr) {
            reject(error || stderr);
        }
        resolve();
    });
});
