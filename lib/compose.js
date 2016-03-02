
import Hapi from 'hapi';

const compose = ({serverConfig = {}, connections = [], plugins = []} = {}) => {

    const server = new Hapi.Server(serverConfig);

    return new Promise(async (resolve, reject) => {
        try {
            for (let connection of connections) {
                server.connection(connection);
            }
            for (let plugin of plugins) {
                await server.register(plugin, { select: plugin.select });
            }

            resolve(server);
        }
        catch (error) {
            reject(error);
        }
    });
};

export default compose;
