'use strict';

const promisify = require("./lib/promisify");
const config = require('./config.json');
const validator = require("./lib/DAEValidator");

const fs = require("fs");
const Path = require("path").posix;

const DOM_parser = require('xmldom').DOMParser;
const valid_path = require('is-valid-path');
const is_url = require("is-url");
const queue = require("queue");
const WebSocketServer = require('ws').Server;

const no_pound_uri_regexp = /^((?!#).)*$/;
const at_least_one_slash_regexp = /\/+/;

const valid_uri = uri => uri && 
    no_pound_uri_regexp.test(uri) &&
    at_least_one_slash_regexp.test(uri) &&
    valid_path(uri);

const sanitize_path = (base, path) => {
    path = Path.normalize(path);
    if (!Path.isAbsolute(path)) {
        path = Path.join(base, path);
    }
    return path;
};

let validate_queue;
let dependencies_queue;

const sanitize_queue = (ref_queue, options) => {
    if (ref_queue) {
        return ref_queue;
    } else {
        let new_queue = queue(options);
        new_queue.on('end', err => {
            if (err) {
                throw err;
            } else {
                new_queue = undefined;
            }
        });
        return new_queue;
    }
};

const add_to_queue = (ref_queue, cb) => {
    ref_queue.push(cb);
};

const collada = {

    start_ws_server: (port, options) => {

        const wss = new WebSocketServer({ port: port });
        wss.on("connection", ws => {
            ws.on('message', msg => {
                const data = JSON.parse(msg);
                switch (data.event) {
                    case "dependencies":
                        dependencies_queue = sanitize_queue(dependencies_queue, {concurrency: 5});
                        add_to_queue(dependencies_queue, cb => {
                            collada
                                .dependencies(data.path)
                                .then(deps => {
                                    ws.send(JSON.stringify({ event: "callback", data: deps, id: data.id }), function (err) {
                                        if (err) {
                                            throw err;
                                        }
                                        cb();
                                    });
                                })
                                .catch(err => {
                                    ws.send(JSON.stringify({ event: "callback", err: err, id: data.id }), function (send_err) {
                                        if (send_err) {
                                            throw send_err;
                                        }
                                        throw err;
                                    });
                                });
                                
                        });
                        dependencies_queue.start(err => {
                            if (err) {
                                console.log(err);
                            }
                            dependencies_queue = undefined;
                        });
                        break;
                    case "validate":
                        validate_queue = sanitize_queue(validate_queue, {concurrency: 15});
                        add_to_queue(validate_queue, cb => {
                            collada
                                .validate(data.path)
                                .then(() => {
                                    ws.send(JSON.stringify({ event: "callback", id: data.id }), function (err) {
                                        if (err) {
                                            throw err;
                                        }
                                        cb();
                                    });
                                })
                                .catch(err => {
                                    ws.send(JSON.stringify({ event: "callback", err: err, id: data.id }), function (send_err) {
                                        if (send_err) {
                                            throw send_err;
                                        }
                                        cb();
                                    });
                                });
                                
                        });
                        validate_queue.start(err => {
                            if (err) {
                                console.log(err);
                            }
                            validate_queue = undefined;
                        });
                        break;
                    default:
                        console.error("Unknow event:"+data.event);
                }
            });
        });
    },

    parse: path => promisify(fs.readFile)(path, 'utf8')
            .then(content => new DOM_parser().parseFromString(content)),

    dependencies: path => {
        let deps = [];
        const dirname = Path.dirname(path);

        const store_dep = value => {
            if (valid_uri(value)) {
                value = !is_url(value) ? sanitize_path(dirname, value) : value;
                deps.push(value);
            }
        };

        return collada.parse(path)
            .then(xml_dom => {
                const header_node = xml_dom.getElementsByTagName("COLLADA")[0];
                const version = header_node
                    .getAttribute("version")
                    // Only major and minor versions
                    .slice(0,3); 
                if (!version && !~Object.keys(config).indexOf(version)) {
                    throw "dependencies(): Not suppported version:" + version;
                }
                const nodes = config[version].dependencies.nodes;
                Object.keys(nodes)
                    .forEach(tag_name => {
                        const elements = xml_dom.getElementsByTagName(tag_name);
                        for (let i=0; i<elements.length; i++) {
                            const element = elements[i];
                            const node = nodes[tag_name];
                            if (node.value && element.childNodes[0]) {
                                store_dep(element.childNodes[0].nodeValue);
                            }
                            if (node.attributes) {
                                for (let i=0; i<node.attributes.length; i++) {
                                    let attribute = node.attributes[i];
                                    store_dep(element.getAttribute(attribute));
                                }
                            }
                        }
                    });
                deps = Array.from(new Set(deps));
                return deps;
            });
    },

    validate: path => validator(path)

};

module.exports = collada;