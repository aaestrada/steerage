'use strict';

const Compose = require('./compose');
const Async = require('./async');
const Resolver = require('./resolver');
const Promisify = require('./promisify');
const Path = require('path');
const Assert = require('assert');
const Util = require('util');

const configure = Async(function *({ config, onconfig, protocols = {}, environment } = {}, callback) {
    Assert.ok(Util.isString(config), 'config must be a string.');

    if (!callback) {
        return new Promise((resolve, reject) => {
            configure({ config, onconfig, protocols, environment }, (error, server) => {
                error ? reject(error) : resolve(server);
            });
        });
    }

    const basedir = Path.dirname(config);
    const resolve = Resolver({ basedir, protocols });

    try {
        const configobject = require(config);
        const store = yield resolve(configobject, Promisify(onconfig));
        const manifest = store.get('/', environment);

        const server = yield Compose(manifest);

        server.app.config = store;

        callback(null, server);
    }
    catch (error) {
        callback(error);
    }
});

module.exports = configure;
module.exports.compose = Compose;
