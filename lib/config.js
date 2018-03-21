'use strict';

const Handlers = require('shortstop-handlers');
const Hoek = require('hoek');
const Determination = require('determination');

const resolve = async function ({ config, basedir, protocols, environment, onconfig }) {
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

    const resolver = Determination.create({
        config,
        protocols,
        criteria: environment
    });

    const resolved = await resolver.resolve();
    const merged = await (onconfig ? onconfig(resolved) : Promise.resolve(resolved));

    return merged;
};

module.exports = { resolve };
