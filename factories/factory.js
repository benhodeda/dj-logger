module.exports = class Factory {

    constructor(config) {
        this.config = config;
    }

    get(name, module) {
        name = name.toLowerCase();
        if (this.config[name]) {
            return this.config[name];
        }
        return require(module);
    }
};