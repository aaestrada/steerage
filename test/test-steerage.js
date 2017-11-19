'use strict';

const Test = require('tape');
const Steerage = require('../lib');
const Path = require('path');
const Hapi = require('hapi');

Test('configures', async function (t) {
    t.plan(7);

    const steerage = await Steerage.init({ config: Path.join(__dirname, 'fixtures', 'config', 'config.json') });

    const server = new Hapi.Server(steerage.config.server);

    try {
        await server.register(steerage);

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

    const steerage = await Steerage.init({
        config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
        environment: {
            env: {
                NODE_ENV: 'production'
            }
        }
    });

    const server = new Hapi.Server(steerage.config.server);

    try {
        await server.register(steerage);

        t.equal(server.settings.debug.log[0], 'warn', 'server settings overriden by environment.');
        t.ok(server.registrations.prodPlugin, 'plugins present on connection.');
    }
    catch (error) {
        console.log(error.stack);
    }
});

Test('hooks', async function (t) {

    const steerage = await Steerage.init({
        config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
        hooks: {
            config: async function (config) {
                t.pass('called config hook');
                return config;
            },
            register: async function (name, config) {
                t.pass('called register hook');
                return config;
            }
        }
    });

    const server = new Hapi.Server(steerage.config.server);

    try {
        await server.register(steerage);

        t.end();
    }
    catch (error) {
        console.log(error.stack);
    }
});

Test('disable plugin', async function (t) {

    const steerage = await Steerage.init({
        config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
        hooks: {
            register: async function (name, config) {
                if (name === 'devPlugin') {
                    config.enabled = false;
                }
                return config;
            }
        }
    });

    const server = new Hapi.Server(steerage.config.server);

    try {
        await server.register(steerage);

        t.ok(!server.registrations.devPlugin, 'did not register disabled plugin.');

        t.end();
    }
    catch (error) {
        console.log(error.stack);
    }
});

Test('error in compose', async function (t) {
    t.plan(1);

    try {
        const steerage = await Steerage.init({
            config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
            hooks: {
                config: async function (config) {
                    config.register.devPlugin = {};
                    return config;
                }
            }
        });

        const server = new Hapi.Server(steerage.config.server);

        await server.register(steerage);
    }
    catch (error) {
        t.pass('received error.');
    }
});

Test('error in hook', async function (t) {
    t.plan(1);

    try {
        const steerage = await Steerage.init({
            config: Path.join(__dirname, 'fixtures', 'config', 'config.json'),
            hooks: {
                config: async function (config) {
                    throw new Error('Blamo!');
                }
            }
        });

        const server = new Hapi.Server(steerage.config.server);

        await server.register(steerage);
    }
    catch (error) {
        t.pass('received error.');
    }
});
