'use strict';

const Joi = require('joi');
const Compose = require('./compose');
const Async = require('./async');
const Resolver = require('./resolver');
const Promisify = require('./promisify');
const Caller = require('caller');
const Path = require('path');
const Assert = require('assert');

const schema = Joi.object({
    server: Joi.object(),
    connections: Joi.object(),
    plugins: Joi.object(),
    routes: Joi.object()
});

const configure = Async(function *({config, protocols = {}, environment} = {}, callback) {
    Assert.ok(config, 'config is required.');
    Assert.ok(typeof config === 'string', 'config must be a path to a configuration file.');

    if (!callback) {
        return new Promise((resolve, reject) => {
            configure({config, protocols, environment}, (error, server) => {
                error ? reject(error) : resolve(server);
            });
        });
    }

    const basedir = Path.dirname(config);
    const validate = Promisify(Joi.validate, Joi);
    const resolve = Resolver({basedir, protocols});

    try {
        const configobject = require(config);
        const store = yield resolve(configobject);
        const manifest = yield validate(store.get('/', environment), schema);
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
