const Factory = require('./factory');
const formatters = require('../configuration/formatters.config');

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