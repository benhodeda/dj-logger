const cls = require('continuation-local-storage');

const defaultSession = cls.getNamespace('dj-logger');

module.exports = startTransaction;

function startTransaction(logger, system, scope, transactionIdHeader = 'transaction-id', callback, session = defaultSession) {
    return (req, res, next) => {
        session.bindEmitter(req);
        session.bindEmitter(res);
        session.run(() => {
            setupTransaction(logger, req, transactionIdHeader, system, scope);
            if (callback) {
                callback(req);
            }
            next();
        });
    }
}

function setupTransaction(logger, req, transactionIdHeader, system, scope) {
    logger.initTransaction(req.headers[transactionIdHeader]);
    logger.setManyParams({
        system,
        scope,
        requestUrl: req.url
    });
}