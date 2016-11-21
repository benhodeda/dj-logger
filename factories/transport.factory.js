const Factory = require('./factory');
const transports = require('../configuration/transports.config.js');

module.exports = class TransportFactory extends Factory {
    constructor() {
        super(transports);
    }
};