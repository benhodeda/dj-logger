const cls = require('continuation-local-storage');
const session = cls.getNamespace('dj-logger');

module.exports = startTransaction;

function startTransaction(logger, system, scope, callback) {
    return function (req, res, next) {
        session.bindEmitter(req);
        session.bindEmitter(res);
        session.run(function () {
            logger.initTransaction();
            logger.sets({
                system: system,
                scope: scope,
                section: "undefined",
                user: req.headers.user || "undefined",
                requestUrl: req.url
            });
            if (callback) {
                callback();
            }
            next();
        });
    }
}