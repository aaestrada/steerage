'use strict';

const Pkg = require('../package.json');
const Compose = require('./compose');
const Resolver = require('./resolver');
const Promisify = require('./promisify');
const Path = require('path');
const Hoek = require('hoek');
const Joi = require('joi');

const schema = Joi.object({
    basedir: Joi.string().allow(null),
    config: Joi.string().required(),
    hooks: Joi.object({
        config: Joi.func().allow(null),
        connection: Joi.func().allow(null),
        register: Joi.func().allow(null)
    }).default(),
    protocols: Joi.object().default(),
    environment: Joi.object().default({ env: process.env })
}).required();

const init = async function (options) {
    const validation = Joi.validate(options, schema);

    Hoek.assert(!validation.error, validation.error);

    const { config, basedir = Path.dirname(config), hooks, protocols, environment } = validation.value;

    const resolve = Resolver({ basedir, config, protocols, environment });

    const store = await resolve(Promisify(hooks.config));

    const app = {
        name: Pkg.name,

        version: Pkg.version,

        register: async function (server) {
            await Compose(server, { store, hooks });
        }
    };

    Object.defineProperty(app, 'config', {
        enumerable: false,
        configurable: false,
        writeable: false,
        value: store.get('server') || {}
    });

    return app;
};

module.exports = { init };
