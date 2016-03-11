'use strict';

import Test from 'tape';
import HapiConfigure from '../dist/lib';
import Path from 'path';

Test('test hapi-configure', t => {

    t.test('configures', async t => {
        t.plan(5);

        try {
            const server = await HapiConfigure();

            t.ok(server, 'server not null.');
            t.equal(server.settings.load.sampleInterval, 1000, 'override server properties.');
            t.equal(server.connections.length, 1, 'set connections.');
            t.ok(server.select('web').registrations.testPlugin, 'plugins present on connection.');
            t.ok(server.app.config.get('server'), 'server.app.config accessible.');
        }
        catch (error) {
            console.log(error.stack);
        }
    });

    t.test('errors', async t => {
        t.plan(1);

        try {
            const server = await HapiConfigure({
                basedir: Path.join(__dirname, 'fixtures/badconfig')
            });
        }
        catch (error) {
            t.equal(error.name, 'ValidationError', 'got validation error.');
        }
    });

});
