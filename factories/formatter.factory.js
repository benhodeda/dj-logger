const formatters = require('../configuration/formatters.config');
const Factory = require('./factory');

module.exports = class FormatterFactory extends Factory {
    constructor() {
        super(formatters);
    }

    get(name) {
        name = name.toLowerCase();
        if (this.config[name]) return this.config[name];
        return super.get(name, name);
    }
};