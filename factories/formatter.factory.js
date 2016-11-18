const formatters = require('../configuration/formatters.config');
const Factory = require('./factory');

module.exports = class FormatterFactory extends Factory {
    constructor() {
        super(formatters);
    }
};