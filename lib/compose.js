
import Hapi from 'hapi';
import Util from 'util';
import Topo from 'topo';

const compose = async ({server = {}, connections = {}, plugins = {}, routes = {}} = {}, callback) => {
    if (!callback) {
        return new Promise((resolve, reject) => {
            compose({server, connections, plugins, routes}, (error, server) => {
                error ? reject(error) : resolve(server);
            });
        });
    }

    try {
        const _server = new Hapi.Server(server);

        for (let [name, connection] of entries(connections)) {
            if (connection.labels) {
                connection.labels.push(name);
            }
            else {
                connection.labels = [name];
            }

            _server.connection(connection);
        }

        const _plugins = new Topo();

        for (let [name, plugin] of entries(plugins)) {
            _plugins.add([plugin], { before: plugin.before, after: plugin.after, group: name });
        }

        for (let plugin of _plugins.nodes) {
            await _server.register(plugin, { select: plugin.select });
        }

        const _routes = new Topo();

        for (let [id, route] of entries(routes)) {
            if (Util.isObject(route.config) && !route.config.id) {
                route.config.id = id;
            }
            _routes.add([route], { before: route.before, after: route.after, group: id });
        }

        for (let route of _routes.nodes) {
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
};

const entries = function* (obj = {}) {
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
};

export default compose;
