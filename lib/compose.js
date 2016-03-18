
import Hapi from 'hapi';
import Util from 'util';
import Topo from 'topo';

const compose = ({server = {}, connections = {}, plugins = {}, routes = {}} = {}) => {
    return new Promise(async (resolve, reject) => {
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

            for (let [path, route] of entries(routes)) {
                const target = route.select ? _server.select(route.select) : _server;

                if (Util.isObject(route.handler) && !route.handler.directory) {
                    const factory = route.handler.method ? route.handler.module[route.handler.method] : route.handler.module;

                    route.handler = factory.apply(null, route.handler.arguments || []);
                }

                target.route({
                    path: path,
                    method: route.method,
                    handler: route.handler,
                    config: route.config
                });
            }

            resolve(_server);
        }
        catch (error) {
            reject(error);
        }
    });
};

const entries = function* (obj = {}) {
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
};

export default compose;
