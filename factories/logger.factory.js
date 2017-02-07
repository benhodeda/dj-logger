const _ = require('lodash');

const Logger = require('../models/logger');

const _loggers = {};
let isInit = false;

module.exports = class LoggerFactory {
    static init(config) {
        if (isInit) throw new Error("Logger Factory has already initialized");
        _.forOwn(config, (loggerConfig, loggerName) => {
            _loggers[loggerName] = new Logger(loggerName, loggerConfig);
        });
        isInit = true;
    }

    static get(name, config) {
        if (!_loggers[name]) _loggers[name] = new Logger(name, config);
        return _loggers[name];
    }
};
