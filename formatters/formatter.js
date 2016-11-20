let loggerParameters;

module.exports = class Formatter {
    constructor(parameters) {
        loggerParameters = parameters;
    }

    format(log) {
        let name = this.constructor.name;
        if (name === 'Formatter') {
            console.error(`Cannot use base Formatter's format(log) function as logger formatter.
                'format' function should be override in ${name} sub-class`);
        } else {
            let params = loggerParameters.get();
            Object.assign(log.meta, params);
            loggerParameters.clear();
        }
    }
};