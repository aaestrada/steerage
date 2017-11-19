'use strict';

const Topo = require('topo');
const Entries = require('entries');
const Promisify = require('./promisify');
const Hoek = require('hoek');
const Props = require('dot-prop');

const compose = async function (server, { store, hooks }) {
    const register = store.get('register') || {};
    const onconnection = Promisify(hooks.connection);
    const onregister = Promisify(hooks.register);
    const serverSettings = store.get('server') || {};
    const appSettings = store.get('server.app') || {};

    server.settings = Hoek.applyToDefaults(server.settings, serverSettings);

    server.app.config = {
        get(key) {
            return Props.get(appSettings, key);
        },
        set(key, value) {
            Props.set(appSettings, key, value);
        }
    };

    const _plugins = new Topo();

    for (const [name, registration] of Entries(register)) {
        const plugin = onregister ? await onregister(name, Object.assign(registration)) : registration;

        if (plugin.enabled === false) {
            continue;
        }

        _plugins.add([plugin], { before: plugin.before, after: plugin.after, group: name });
    }

    for (const plugin of _plugins.nodes) {
        await server.register({
            plugin: plugin.plugin,
            options: plugin.options
        });
    }
};

module.exports = compose;
