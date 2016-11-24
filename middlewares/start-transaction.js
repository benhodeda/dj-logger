const cls = require('continuation-local-storage');

const session = cls.getNamespace('dj-logger');

module.exports = startTransaction;

function startTransaction(logger, system, scope, transactionIdHeader = 'transaction-id', callback) {
    return (req, res, next) => {
        session.bindEmitter(req);
        session.bindEmitter(res);
        session.run(() => {
            logger.initTransaction(req.headers[transactionIdHeader]);
            logger.setManyParams({
                system,
                scope,
                requestUrl: req.url
            });
            if (callback) {
                callback(req);
            }
            next();
        });
    }
}