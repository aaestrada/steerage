'use strict';

const Hapi = require('hapi');
const Util = require('util');
const Topo = require('topo');
const Entries = require('entries');
const Async = require('./async');

const compose = Async(function *({ server = {}, connections = {}, plugins = {}, routes = {} } = {}, callback) {
    if (!callback) {
        return new Promise((resolve, reject) => {
            compose({ server, connections, plugins, routes }, (error, server) => {
                error ? reject(error) : resolve(server);
            });
        });
    }

    try {
        const _server = new Hapi.Server(server);

        for (const [name, connection] of Entries(connections)) {
            if (connection.labels) {
                connection.labels.push(name);
            }
            else {
                connection.labels = [name];
            }

            _server.connection(connection);
        }

        const _plugins = new Topo();

        for (const [name, plugin] of Entries(plugins)) {
            _plugins.add([plugin], { before: plugin.before, after: plugin.after, group: name });
        }

        for (const plugin of _plugins.nodes) {
            yield _server.register(plugin, { select: plugin.select });
        }

        const _routes = new Topo();

        for (const [id, route] of Entries(routes)) {
            if (Util.isObject(route.config) && !route.config.id) {
                route.config.id = id;
            }
            _routes.add([route], { before: route.before, after: route.after, group: id });
        }

        for (const route of _routes.nodes) {
            const target = route.select ? _server.select(route.select) : _server;

            if (Util.isObject(route.handler) && !route.handler.directory) {
                const context = { server: _server, target };
                const factory = route.handler.method ? route.handler.module[route.handler.method] : route.handler.module;

                route.handler = factory.apply(context, route.handler.arguments || []);
            }

            target.route({
                path: route.path,
                method: route.method,
                handler: route.handler,
                config: route.config
            });
        }

        callback(null, _server);
    }
    catch (error) {
        callback(error);
    }
});

module.exports = compose;
