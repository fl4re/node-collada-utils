'use strict';

const exec = require('child_process').exec;
const fs = require('fs');
const Path = require('path').posix;
const isWin = /^win/.test(process.platform);
const valid_command = path => (isWin?"":"./") + 'DAEValidator ' + path;
const cwd = Path.join(__dirname.replace(/\\/g, '/'), isWin ? '/OpenCOLLADA/build/Release/' : '/OpenCOLLADA/build/bin/');

module.exports = path => new Promise((resolve, reject) => {
    exec(valid_command(path), { cwd: cwd }, (error, stdout, stderr) => {
        if (error || stderr) {
            reject(error || stderr);
        }
        resolve();
    });
});
