'use strict';

import Test from 'tape';
import Compose from '../dist/lib/compose';

const plugin = (name, version, register) => {
    register.attributes = {name, version};

    return register;
};

Test('test compose', async t => {
    t.plan(8);

    const manifest = {
        server: {
            load: {
                sampleInterval: 1000
            }
        },
        connections: {
            web: {
                port: 3000,
                labels: ['web']
            }
        },
        plugins: {
            testPlugin: plugin('testPlugin', '1.0.0', (server, options, next) => {
                t.pass('registered plugin.');
                next();
            })
        },
        routes: {
            testRoute: {
                path: '/test',
                method: 'GET',
                handler: {
                    module: function () {
                        t.pass('added routes.');
                        t.ok(this.server, 'server passed in context.');
                        t.ok(this.target, 'target passed in context.');

                        return function (request, reply) {
                            reply('success.');
                        }
                    },
                    select: 'web'
                }
            }
        }
    };

    try {
        const server = await Compose(manifest);

        t.ok(server, 'server not null.');
        t.equal(server.settings.load.sampleInterval, 1000, 'set server properties.');
        t.equal(server.connections.length, 1, 'set connections.');
        t.ok(server.select('web').registrations.testPlugin, 'plugins present on connection.');
    }
    catch (error) {
        console.log(error.stack);
    }
});
