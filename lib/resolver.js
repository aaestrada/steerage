'use strict';

const Entries = require('entries');
const Shortstop = require('shortstop');
const Handlers = require('shortstop-handlers');
const Confidence = require('confidence');
const Promisify = require('./promisify');
const Async = require('./async');
const Hoek = require('hoek');

const createResolver = function (protocols) {
    const shortstop = Shortstop.create();

    for (const [key, value] of Entries(protocols)) {
        shortstop.use(key, value);
    }

    return Promisify(shortstop.resolve, shortstop);
};

const create = function ({ basedir, protocols }) {

    const defaultProtocols = {
        file:    Handlers.file(basedir),
        path:    Handlers.path(basedir),
        base64:  Handlers.base64(),
        env:     Handlers.env(),
        require: Handlers.require(basedir),
        exec:    Handlers.exec(basedir),
        glob:    Handlers.glob(basedir)
    };

    protocols = Hoek.applyToDefaults(defaultProtocols, protocols);

    const defaultResolver = createResolver(protocols);

    return Async(function *(config, onconfig) {
        const defaultResolved = yield defaultResolver(config);

        const configResolver = createResolver({
            config(key) {
                const keys = key.split('.');
                let result = defaultResolved;

                while (result && keys.length) {
                    const prop = keys.shift();

                    if (!result.hasOwnProperty(prop)) {
                        return undefined;
                    }

                    result = result[prop];
                }

                return keys.length ? null : result;
            }
        });

        const resolved = yield configResolver(defaultResolved);
        const merged = onconfig ? yield onconfig(resolved) : resolved;
        const store = new Confidence.Store(merged);
        return store;
    });
};

module.exports = create;
