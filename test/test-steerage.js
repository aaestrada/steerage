'use strict';

const Test = require('tape');
const Steerage = require('../lib');
const Async = require('../lib/async');
const Path = require('path');

Test('test steerage', (t) => {

    t.test('configures', Async(function *(t) {
        t.plan(7);

        try {
            const server = yield Steerage({
                config: Path.join(__dirname, 'fixtures', 'config', 'config.json')
            });

            t.ok(server, 'server not null.');
            t.equal(server.settings.debug.log[0], 'debug', 'override server properties.');
            t.equal(server.connections.length, 2, 'set connections.');
            t.ok(server.select('web').registrations.devPlugin, 'plugins present on connection.');

            const plugins = Object.keys(server.select('web').registrations);

            t.equal(plugins.length, 2, 'registered two plugins.');

            t.equal(plugins[0], 'otherPlugin', 're-ordered plugins.');

            t.ok(server.app.config.get('/server'), 'server.app.config accessible.');
        }
        catch (error) {
            console.log(error.stack);
        }
    }));

    t.test('environment', Async(function *(t) {
        t.plan(2);

        try {
            const server = yield Steerage({
                config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
                environment: {
                    env: {
                        NODE_ENV: 'production'
                    }
                }
            });

            t.equal(server.settings.debug.log[0], 'warn', 'override server properties.');
            t.ok(server.select('web').registrations.prodPlugin, 'plugins present on connection.');
        }
        catch (error) {
            console.log(error.stack);
        }
    }));


    t.test('hooks', Async(function *(t) {
        try {
            yield Steerage({
                config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
                hooks: {
                    config(config, callback) {
                        t.pass('called config hook');
                        callback(null, config);
                    },
                    connection(name, config, callback) {
                        t.pass('called connection hook');
                        callback(null, config);
                    },
                    register(name, config, callback) {
                        t.pass('called register hook');
                        callback(null, config);
                    }
                }
            });

            t.end();
        }
        catch (error) {
            console.log(error.stack);
        }
    }));

    t.test('disable plugin', Async(function *(t) {
        try {
            const server = yield Steerage({
                config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
                hooks: {
                    register(name, config, callback) {
                        if (name === 'devPlugin') {
                            config.enabled = false;
                        }
                        callback(null, config);
                    }
                }
            });

            t.ok(!server.select('web').registrations.devPlugin, 'did not register disabled plugin.');

            t.end();
        }
        catch (error) {
            console.log(error.stack);
        }
    }));

    t.test('error in compose', Async(function *(t) {
        t.plan(1);

        try {
            yield Steerage({
                config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
                hooks: {
                    config(config, callback) {
                        config.register.devPlugin = {};
                        callback(null, config);
                    }
                }
            });
        }
        catch (error) {
            t.pass('received error.');
        }
    }));

    t.test('error in hook', Async(function *(t) {
        t.plan(1);

        try {
            yield Steerage({
                config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
                hooks: {
                    config(config, callback) {
                        callback(new Error('blamo'));
                    }
                }
            });
        }
        catch (error) {
            t.pass('received error.');
        }
    }));

});
