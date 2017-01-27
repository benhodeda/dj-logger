const uuid = require('node-uuid');
const cls = require('continuation-local-storage');

const tidKey = 'tid';
const paramsKey = 'logger-params';
const _session = Symbol();
const _uuid = Symbol();

module.exports = class Parameters {
    constructor(storage = cls, uuidGenerator = uuid) {
        this[_session] = storage.getNamespace('dj-logger');
        this[_uuid] = uuidGenerator;
    }
    
    setTransactionId(tid) {
        this[_session].set(tidKey, tid || this[_uuid].v4());
    }

    getTransactionId() {
        return this[_session].active ? this[_session].get(tidKey) : undefined;
    }

    set(key, value) {
        let params = this[_session].get(paramsKey);
        params[key] = value;
        this[_session].set(paramsKey, params);
    }

    setMany(dataDictionary) {
        let params = this[_session].get(paramsKey);
        Object.assign(params, dataDictionary);
        this[_session].set(paramsKey, params);
    }

    get() {
        return this[_session].active ? this[_session].get(paramsKey) : {};
    }

    clear() {
        if (this[_session].active) this[_session].set(paramsKey, {});
    }
};