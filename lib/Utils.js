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

        const {
            basedir,
            config,
            environment,
            protocols,
            userConfigPath
        } = options;

        const defaultConfigBaseDir = Path.dirname(config);

        const protoObj = protocols[0](defaultConfigBaseDir);

        const resolved = await Config.resolve({
            basedir: defaultConfigBaseDir,
            config,
            environment,
            protocols: protoObj
        });

        // userConfigPath may contain a path or an array of paths to a user manifest. If it does, merge it with default configs.
        if (userConfigPath) {
            // Validate manifest files. If an array of manifest file paths are
            // passed, each will be validated, merged, and returned as one config.
            const [defaultUserConfigBasePath, ...userConfigPaths] = userConfigPath;
            const defaultUserConfigBaseDir = Path.dirname(defaultUserConfigBasePath);

            const userConfigProtoObj = protocols[1](defaultUserConfigBaseDir);

            const resolvedMainUserConfig = await Config.resolve({
                basedir: defaultUserConfigBaseDir,
                config: defaultUserConfigBasePath,
                environment,
                protocols: userConfigProtoObj
            });

            resolved.merge(resolvedMainUserConfig.data);

            const validated = await this.asyncReduce(
                userConfigPaths,
                async (validatedAndMergedManifestConfigs, configPath) => {

                    const whichBaseDir = basedir || Path.dirname(configPath);
                    const userProtoObj = protocols[1](whichBaseDir);

                    const user = await Utils.createManifestResolver({
                        config: configPath,
                        basedir: whichBaseDir,
                        protocols: userProtoObj,
                        environment
                    });

                    resolved.merge(user.data);
                    return validatedAndMergedManifestConfigs;
                },
                {}
            );
            console.log(validated);
        }


        return resolved;
    }
};

module.exports = Utils;
