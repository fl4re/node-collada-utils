'use strict';

const promisify = require("./lib/promisify");
const config = require('./config.json');
const validator = require("./lib/DAEValidator");

const fs = require("fs");
const Path = require("path").posix;

const DOM_parser = require('xmldom').DOMParser;
const valid_path = require('is-valid-path');
const is_url = require("is-url");

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

const collada = {

    parse: (path) => {
        return promisify(fs.readFile)(path, 'utf8')
            .then(content => new DOM_parser().parseFromString(content));
    },

    dependencies: (path) => {
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

    validate: (path) => validator(path)

};

module.exports = collada;