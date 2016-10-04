'use strict';

const Test = require('tape');
const Configure = require('../lib');
const Async = require('../lib/async');
const Path = require('path');

Test('test hapi-configure', (t) => {

    t.test('configures', Async(function *(t) {
        t.plan(7);

        try {
            const server = yield Configure({
                config: Path.join(__dirname, 'fixtures', 'config', 'config.json')
            });

            t.ok(server, 'server not null.');
            t.ok(server.settings.debug.log, 'override server properties.');
            t.equal(server.connections.length, 2, 'set connections.');
            t.ok(server.select('web').registrations.testPlugin, 'plugins present on connection.');

            const plugins = Object.keys(server.select('web').registrations);

            t.equal(plugins[0], 'testPlugin2', 're-ordered plugins.');

            t.ok(server.app.config.get('/server'), 'server.app.config accessible.');

            const response = yield server.select('web').inject({
                method: 'GET',
                url: '/test'
            });

            t.equal(response.payload, 'testArgument', 'added arguments to handler factory.');
        }
        catch (error) {
            console.log(error.stack);
        }
    }));

    t.test('errors', Async(function *(t) {
        t.plan(1);

        try {
            const server = yield Configure({
                config: Path.join(__dirname, 'fixtures', 'badconfig', 'config.json')
            });
        }
        catch (error) {
            t.equal(error.name, 'ValidationError', 'got validation error.');
        }
    }));

});
