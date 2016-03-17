'use strict';

//Top level factory method for /test2 in tests.
const handler = (arg) => {
    return function (request, reply) {
        reply(arg);
    };
};

//Factory method for /test in tests.
handler.createHandler = (arg) => {
    return function (request, reply) {
        reply(arg);
    };
}

module.exports = handler;
