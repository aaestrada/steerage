'use strict';

const Test = require('tape');
const Steerage = require('../lib');
const Path = require('path');
const Hapi = require('hapi');

Test('configures', async function (t) {
    t.plan(1);

    const init = async function (options = {}) {
        const app = {
            plugin: {
                name: 'test',
                version: '1.0.0',
                register: function (server, options = {}) {
                    console.log('registered.');
                    console.log(JSON.stringify(options));
                }
            },
            options: {
                optionsPassed: true
            }
        };

        app.config = { port: 8000 };

        return app;
    };

    const app = await Catalyst.init({ config: Path.join('.', 'config.json') });

    const server = new Hapi.Server(app.config);

    await server.register(app);

    t.pass();

});

Test.only('configures', async function (t) {
    t.plan(7);

    const app = await Steerage.init({ config: Path.join(__dirname, 'fixtures', 'config', 'config.json') });

    const server = new Hapi.Server(app.config);

    try {
        await server.register(app);

        t.equal(server.settings.debug.log[0], 'debug', 'override of server settings.');

        const plugins = Object.keys(server.registrations);

        t.equal(plugins.length, 3, 'registered two plugins.');

        t.equal(plugins[1], 'otherPlugin', 're-ordered plugins.');

        t.equal(server.settings.app.name, 'testApp', 'server.settings.app available.');

        t.equal(server.settings.app.nameCopy, 'testApp', 'server.settings.app.nameCopy from config protocol.');

        t.equal(server.app.config.get('name'), 'testApp', 'server.app.config get.');

        server.app.config.set('hello.world', 'hello world!');

        t.equal(server.app.config.get('hello.world'), 'hello world!', 'server.app.config set.');
    }
    catch (error) {
        console.log(error.stack);
    }

});

Test('environment', async function (t) {
    t.plan(2);

    const server = new Hapi.Server();

    try {
         await server.register({
            register: Steerage,
            options: {
                config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
                environment: {
                    env: {
                        NODE_ENV: 'production'
                    }
                }
            }
        });

        t.equal(server.settings.debug.log[0], 'warn', 'server settings overriden by environment.');
        t.ok(server.select('web').registrations.prodPlugin, 'plugins present on connection.');
    }
    catch (error) {
        console.log(error.stack);
    }
});

Test('hooks', async function (t) {

    const server = new Hapi.Server();

    try {
         await server.register({
            register: Steerage,
            options: {
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
            }
        });

        t.end();
    }
    catch (error) {
        console.log(error.stack);
    }
});

Test('disable plugin', async function (t) {

    const server = new Hapi.Server();

    try {
         await server.register({
            register: Steerage,
            options: {
                config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
                hooks: {
                    register(name, config, callback) {
                        if (name === 'devPlugin') {
                            config.enabled = false;
                        }
                        callback(null, config);
                    }
                }
            }
        });

        t.ok(!server.select('web').registrations.devPlugin, 'did not register disabled plugin.');

        t.end();
    }
    catch (error) {
        console.log(error.stack);
    }
});

Test('error in compose', async function (t) {
    t.plan(1);

    const server = new Hapi.Server();

    try {
         await server.register({
            register: Steerage,
            options: {
                config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
                hooks: {
                    config(config, callback) {
                        config.register.devPlugin = {};
                        callback(null, config);
                    }
                }
            }
        });
    }
    catch (error) {
        t.pass('received error.');
    }
});

Test('error in hook', async function (t) {
    t.plan(1);

    const server = new Hapi.Server();

    try {
         await server.register({
            register: Steerage,
            options: {
                config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
                hooks: {
                    config(config, callback) {
                        callback(new Error('blamo'));
                    }
                }
            }
        });
    }
    catch (error) {
        t.pass('received error.');
    }
});
