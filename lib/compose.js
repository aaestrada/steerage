'use strict';

const Topo = require('topo');
const Entries = require('entries');
const Hoek = require('hoek');
const Props = require('dot-prop');

const compose = async function (server, { store, hooks }) {
    const register = store.get('register') || {};
    const onregister = hooks.register;
    const appSettings = store.get('server.app') || {};

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
        const plugin = await onregister ? onregister(name, Object.assign(registration)) : Promise.resolve(registration);

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
