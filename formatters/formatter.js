const _loggerParameters = Symbol('loggerParameters');

module.exports = class Formatter {
    constructor(parameters) {
        this[_loggerParameters] = parameters;
    }

    format(log) {
        let name = this.constructor.name;
        if (name === 'Formatter') {
            console.error(`Cannot use base Formatter's format(log) function as logger formatter.
                'format' function should be override in sub-class`);
        } else {
            let params = this[_loggerParameters].get();
            let tid = this[_loggerParameters].getTransactionId();
            Object.assign(log.meta, params, {transactionId: tid});
        }
    }
};