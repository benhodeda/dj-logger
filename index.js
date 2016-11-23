require('continuation-local-storage').createNamespace('dj-logger');

const Logger = require('./models/logger');
const Formatter = require('./formatters/formatter');
const LoggerFactory = require('./factories/logger.factory');
const startTransaction = require('./middlewares/start-transaction.js');

module.exports = {
    Logger,
    Formatter,
    LoggerFactory,
    startTransaction
};