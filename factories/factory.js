module.exports = class Factory {

    constructor(collection) {
        this.collection = collection || {};
    }

    get(name, module) {
        name = name.toLowerCase();
        if (!this.collection.hasOwnProperty(name)) {
            this.collection[name] = (typeof(module) === "object") ? module : require(module);
        }
        return this.collection[name];
    }
};