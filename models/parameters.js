const uuid = require('node-uuid');
const cls = require('continuation-local-storage');

const tidKey = 'tid';
const paramsKey = 'logger-params';
const session = cls.getNamespace('dj-logger');

module.exports = class Parameters {
    setTransactionId(tid) {
        session.set(tidKey, tid || uuid.v4());
    }

    getTransactionId() {
        return session.active ? session.get(tidKey) : undefined;
    }

    set(key, value) {
        let params = session.get(paramsKey);
        params[key] = value;
        session.set(paramsKey, params);
    }

    setMany(dataDictionary) {
        let params = session.get(paramsKey);
        Object.assign(params, dataDictionary);
        session.set(paramsKey, params);
    }

    get() {
        return session.active ? session.get(paramsKey) : {};
    }

    clear() {
        if (session.active) session.set(paramsKey, {});
    }
};