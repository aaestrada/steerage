'use strict';

const Compose = require('./compose');
const Async = require('./async');
const Resolver = require('./resolver');
const Promisify = require('./promisify');
const Path = require('path');
const Assert = require('assert');
const Util = require('util');
const Shush = require('shush');

const configure = Async(function *({ basedir, config, onconfig, protocols = {}, environment } = {}, callback) {
    Assert.ok(Util.isString(config), 'config must be a string.');

    basedir = basedir || Path.dirname(config);

    if (!callback) {
        return new Promise((resolve, reject) => {
            configure({ basedir, config, onconfig, protocols, environment }, (error, server) => {
                error ? reject(error) : resolve(server);
            });
        });
    }

    const resolve = Resolver({ basedir, protocols });

    try {
        const configobject = Shush(config);
        const store = yield resolve(configobject, Promisify(onconfig));
        const server = yield Compose({ store, environment });

        callback(null, server);
    }
    catch (error) {
        callback(error);
    }
});

module.exports = configure;
