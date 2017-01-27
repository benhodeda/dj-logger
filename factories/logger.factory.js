const _ = require('lodash');

const DefaultLogger = require('../models/logger');

const _loggers = Symbol('loggers');
const _Logger = Symbol('Logger');

module.exports = class LoggerFactory {
    constructor(config, Logger = DefaultLogger) {
        this[_loggers] = {};
        this[_Logger] = Logger;
        _.forOwn(config, (loggerConfig, loggerName) => {
            this[_loggers][loggerName] = new this[_Logger](loggerName, loggerConfig);
        });
    }

    get(name, config) {
        if (!this[_loggers][name]) this[_loggers][name] = new this[_Logger](name, config);
        return this[_loggers][name];
    }
};
