
import Hapi from 'hapi';

const compose = ({server = {}, connections = [], plugins = []} = {}) => {
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
            for (let [name, plugin] of entries(plugins)) {
                await _server.register(plugin, { select: plugin.select });
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
