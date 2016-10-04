#!/usr/bin/env node

'use strict';

const Configure = require('../lib');
const Path = require('path');

Configure({ config:  Path.resolve(Path.resolve(process.argv[2])) }).then((server) => {
    server.start((error) => {
        if (error) {
            throw error;
        }

        for (let connection of server.connections) {
            console.log(`${connection.info.uri} listening.`);
        }
    });
})
.catch((error) => {
    console.error(error);
    process.exit(1);
});
