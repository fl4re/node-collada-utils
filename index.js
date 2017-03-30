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

const parse_document_from_config = (config_node_descriptions, xml_dom) => {
    let res = [];
    Object.keys(config_node_descriptions)
        .forEach(tag_name => {
            const elements = xml_dom.getElementsByTagName(tag_name);
            for (let i=0; i<elements.length; i++) {
                const element = elements[i];
                const node = config_node_descriptions[tag_name];
                const first_child = element.childNodes[0];
                // if the dep is the node value
                if (node.value && first_child) {
                    res.push(first_child.nodeValue);
                }
                // if the dep is defined by one attribute
                if (node.attribute) {
                    for (let i=0; i<node.attribute.length; i++) {
                        let attribute = node.attribute[i];
                        res.push(element.getAttribute(attribute));
                    }
                }
            }
        });
    return res;
};

// Slice only major and minor versions
const get_version = header_node =>  header_node.getAttribute("version").slice(0,3);

const collada = {

    parse: path => promisify(fs.readFile)(path, 'utf8')
            .then(content => new Promise((resolve, reject) => {
                const options = { 
                    locator: {},
                    errorHandler: {
                        error: reject,
                        fatalError: reject
                    }
                };       
                const collada = new DOM_parser(options).parseFromString(content);
                resolve(collada);
            })),

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
                const version = get_version(header_node);
                const is_version_supported = ~Object.keys(config).indexOf(version);
                if (!version || !is_version_supported) {
                    throw "dependencies(): Not suppported version:" + version;
                }
                const node_descriptions = config[version].dependency;
                parse_document_from_config(node_descriptions, xml_dom).forEach(store_dep);
                deps = Array.from(new Set(deps)); //make the array unique after sanitizing
                return deps;
            });
    },

    main_dependency: path => collada.parse(path)
        .then(xml_dom => {
            const header_node = xml_dom.getElementsByTagName("COLLADA")[0];
            const version = get_version(header_node);
            const is_version_supported = ~Object.keys(config).indexOf(version);
            if (!version || !is_version_supported) {
                throw "dependencies(): Not suppported version:" + version;
            }
            const node_description = config[version].main_dependency;
            const res = parse_document_from_config(node_description, xml_dom);
            if (res.length > 1) {
                throw "Conflict, several main dependency nodes are found in the document";
            }
            return res[0];
        }),

    validate: path => validator(path)

};

module.exports = collada;