
import Hapi from 'hapi';

const compose = ({server = {}, connections = [], plugins = []} = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const _server = new Hapi.Server(server);

            for (let connection of connections) {
                _server.connection(connection);
            }
            for (let plugin of plugins) {
                await _server.register(plugin, { select: plugin.select });
            }

            resolve(_server);
        }
        catch (error) {
            reject(error);
        }
    });
};

export default compose;
