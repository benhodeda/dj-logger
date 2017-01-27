const _ = require('lodash');
const _winston = require('winston');

const Factory = require('./factory');

module.exports = class TransportFactory extends Factory {
    constructor(winston = _winston) {
        let transports = {};
        _.forOwn(winston.transports, (transport, key) => transports[key.toLowerCase()] = transport);
        super(transports);
    }
};