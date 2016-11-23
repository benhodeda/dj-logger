const Factory = require('./factory');
const formatters = require('../formatters/formatter.collection.js');

module.exports = class FormatterFactory extends Factory {
    constructor() {
        super(formatters);
    }

    get(name) {
        return super.get(name, name);
    }
};