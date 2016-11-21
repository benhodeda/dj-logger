require('continuation-local-storage').createNamespace('dj-logger');

const Logger = require('./logger');
const Formatter = require('./formatters/formatter');
const startTransaction = require('./start.middleware');
const LoggerFactory = require('./factories/logger.factory');

module.exports = {
    Logger,
    Formatter,
    LoggerFactory,
    startTransaction
};