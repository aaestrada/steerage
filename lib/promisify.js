'use strict';

const promisify = (fn, context) => {
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn.apply(context, [...args, (error, result) => {
                error ? reject(error) : resolve(result);
            }]);
        });
    };
};

module.exports = promisify;
