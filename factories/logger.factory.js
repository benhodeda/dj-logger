const Logger = require('../models/logger');

let loggers = {};

module.exports = class LoggerFactory {
    static get(name, config) {
        if (!loggers[name]) loggers[name] = new Logger(name, config);
        return loggers[name];
    }
};

