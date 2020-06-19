'use strict';

// const Hoek = require('@hapi/hoek');
const Path = require('path');
const Config = require('./config');

const Utils = {
    async asyncReduce(array, handler, startingValue) {

        let result = startingValue;

        for (const value of array) {
            // `await` will transform result of the function to the promise,
            // even it is a synchronous call
            result = await handler(result, value);
        }

        return result;
    },

    async createManifestResolver(options) {
        // Some file watchers only watch a file if it's been require'd.
        // Determination doesn't call "require()" on the file internally,
        // so by "require"-ing here, we allow for file watching.
        // Parsing is expected to fail since manifests allow for comments.
        Utils.safeRequire(options.config);

        // Create and return the resolver
        return await Config.resolve(options);
    },

    safeRequire(name) { // eslint-disable-line consistent-return

        try {
            return require(name);
        }
        catch (e) {
            // noop
        }
    },

    async validateAndMergeManifestConfigs(options) {

        let {
            config,
            basedir,
            protocols,
            environment,
            userConfigPath
        } = options;
        const protoObj = protocols[0](basedir);
        const resolved = await Config.resolve({
            config,
            basedir,
            protocols: protoObj,
            environment
        });

        if (userConfigPath.length) {
            basedir = Path.dirname(userConfigPath);
            const userProtoObj = protocols[1](basedir);

            const user = await Config.resolve({
                config: userConfigPath,
                basedir,
                protocols: userProtoObj,
                environment
            });
            resolved.merge(user.data);
        }

        return resolved;

        /* const validatedManifestConfigs = await Utils.asyncReduce(
            userConfigPath,
            async (validatedAndMergedManifestConfigs, configPath) => {

                // const currentBaseDir = basedir || Path.dirname(configPath);
                // const defaults = await protocols(currentBaseDir, configPath);
                // const finalProtocols = Hoek.applyToDefaults(
                //     defaults,
                //     shortstopHandlers);
                // const protocols = Hoek.applyToDefaults({
                //     file: Handlers.file(currentBaseDir),
                //     path: Handlers.path(currentBaseDir),
                //     base64: Handlers.base64(),
                //     env: Handlers.env(),
                //     require: Handlers.require(currentBaseDir),
                //     exec: Handlers.exec(currentBaseDir),
                //     glob: Handlers.glob(currentBaseDir),
                //     eval: evalHandler,
                //     secret: await SecretHandler.init(secretsConfig)
                // }, shortstopHandlers);

                // resolver for user config
                const appconfig = await Utils.createManifestResolver({
                    config: configPath,
                    // protocols: await protocols(configPath),
                    criteria: environment
                });

                // const appconfig = await resolver.resolve();
                // const validatedManifestConfig = await manifestSchema.validateAsync(appconfig.data);
                // return Hoek.merge(validatedAndMergedManifestConfigs, validatedManifestConfig);
                // if (validatedAndMergedManifestConfigs === null) {
                //     validatedAndMergedManifestConfigs = appconfig;
                //     return validatedAndMergedManifestConfigs;
                // }

                validatedAndMergedManifestConfigs.merge(appconfig.data);
                return validatedAndMergedManifestConfigs;
            }, resolved);

        return validatedManifestConfigs; */
    }
};

module.exports = Utils;
