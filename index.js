//TODO: order by length, first bulk of node modules, second bulk realtive path modules

require('continuation-local-storage').createNamespace('dj-logger');
const LoggerFactory = require('./factories/logger.factory');
const startTransaction = require('./start.middleware');
const Formatter = require('./formatters/formatter');
const Logger = require('./logger');

module.exports = {
    Logger,
    Formatter,
    LoggerFactory,
    startTransaction
};
