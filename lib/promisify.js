'use strict';

const promisify = (fn, context) => {
    if (!fn) {
        return;
    }

    return (...args) => {
        return new Promise((resolve, reject) => {
            fn.apply(context, [...args, (error, result) => {
                error ? reject(error) : resolve(result);
            }]);
        });
    };
};

module.exports = promisify;
