'use strict';

// const Hoek = require('@hapi/hoek');
const Path = require('path');
const Config = require('./config');

const Utils = {
    async createConfigResolver(options) {
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

    async mergeManifestConfigs(options) {

        const {
            basedir,
            config,
            environment,
            protocols,
            userConfigPaths
        } = options;

        const baseConfigBaseDir = Path.dirname(config);

        const resolved = await Config.resolve({
            basedir: baseConfigBaseDir,
            config,
            environment,
            protocols
        });

        // userConfigPaths may contain a path or an array of paths to a user config. If it does, merge it with base config above.
        if (Array.isArray(userConfigPaths) && userConfigPaths.length) {
            for (const configPath of userConfigPaths) {

                const userConfig = await Utils.createConfigResolver({
                    config: configPath,
                    basedir: basedir || Path.dirname(configPath),
                    protocols,
                    environment
                });

                resolved.merge(userConfig.data);
            }
        }


        return resolved;
    }
};

module.exports = Utils;
