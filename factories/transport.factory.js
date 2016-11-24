const _ = require('lodash');
const winston = require('winston');

const Factory = require('./factory');

module.exports = class TransportFactory extends Factory {
    constructor() {
        let transports = {};
        _.forOwn(winston.transports, (transport, key) => transports[key.toLowerCase()] = transport);
        super(transports);
    }
};