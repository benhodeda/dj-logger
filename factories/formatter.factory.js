const Factory = require('./factory');
const formatters = require('../configuration/formatters.config');

module.exports = class FormatterFactory extends Factory {
    constructor() {
        super(formatters);
    }
};