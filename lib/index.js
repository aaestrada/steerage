
import Confit from 'confit';
import Handlers from 'shortstop-handlers';
import Path from 'path';
import Joi from 'joi';

const schema = Joi.object({
    server: Joi.object(),
    connections: Joi.array(Joi.object()),
    plugins: Joi.array().items(Joi.object({
        register: Joi.object(),
        options: Joi.object(),
        select: Joi.array().items(Joi.string())
    }))
});

const configure = async ({basedir = Path.join(__dirname, 'config'), protocols = {}} = {}, callback) => {
    if (!callback) {
        return promisify(configure);
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

    const factory = Confit.create({basedir, protocols});
    const create = promisify(factory.create);
    const validate = promisify(Joi.validate);

    try {
        const config = await validate(await create(), schema);

        Compose(config).then(server => callback(null, server)).catch(callback);
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

export default configure;
