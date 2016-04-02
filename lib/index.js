
import Confit from 'confit';
import Handlers from 'shortstop-handlers';
import Path from 'path';
import Joi from 'joi';
import Compose from './compose';
import Caller from 'caller';

const schema = Joi.object({
    server: Joi.object(),
    connections: Joi.object(),
    plugins: Joi.object(),
    routes: Joi.object()
});

const configure = async ({basedir = Path.join(Path.dirname(Caller()), 'config'), protocols = {}} = {}, callback) => {
    if (!callback) {
        return new Promise((resolve, reject) => {
            configure({basedir, protocols}, (error, server) => {
                error ? reject(error) : resolve(server);
            });
        });
    }

    const defaultProtocols = {
        file:    Handlers.file(basedir),
        path:    Handlers.path(basedir),
        base64:  Handlers.base64(),
        env:     Handlers.env(),
        require: Handlers.require(basedir),
        exec:    Handlers.exec(basedir),
        glob:    Handlers.glob(basedir)
    };

    protocols = Object.assign(defaultProtocols, protocols);

    const factory = Confit({basedir, protocols});
    const create = promisify(factory.create, factory);
    const validate = promisify(Joi.validate, Joi);

    try {
        const config = await create();

        const manifest = await validate({
            server: config.get('server'),
            connections: config.get('connections'),
            plugins: config.get('plugins'),
            routes: config.get('routes')
        }, schema);

        const server = await Compose(manifest);

        server.app.config = config;

        callback(null, server);
    }
    catch (error) {
        callback(error);
    }
};

const promisify = (fn, context) => {
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn.apply(context, [...args, (error, result) => {
                error ? reject(error) : resolve(result);
            }]);
        });
    };
};

export { configure as default, Compose as compose };
