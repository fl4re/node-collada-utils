'use strict';

function promisify(f) {
    var g = function () {
        var args = Array.prototype.slice.call(arguments);
        return new Promise(function (fulfill, reject) {
            var callback = function (err) {
                if (err) {return reject(err);}
                var args2 = Array.prototype.slice.call(arguments, 1);
                fulfill.apply(undefined, args2);
            };
            args.push(callback);
            f.apply(undefined, args);
        });
    };
    return g;
}

module.exports = promisify;
