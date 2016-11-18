const transports = require('../configuration/transports.config.js');
const Factory = require('./factory');

module.exports = class TransportFactory extends Factory {
    constructor() {
        super(transports);
    }
};