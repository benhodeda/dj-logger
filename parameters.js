const cls = require('continuation-local-storage');
const uuid = require('node-uuid');

const session = cls.getNamespace('dj-logger');

const sessionKey = 'logger-params';
const tidKey = 'tid';

module.exports = class Parameters {
    setTransactionId(tid) {
        session.set(tidKey, tid || uuid.v4());
    }

    getTransactionId() {
        return session.active ? session.get(tidKey) : undefined;
    }

    set(key, value) {
        let params = session.get(sessionKey);
        params[key] = value;
        session.set(sessionKey, params);
    }

    sets(data) {
        let params = session.get(sessionKey);
        Object.assign(params, data);
        session.set(sessionKey, params);
    }

    get() {
        return session.active ? session.get(sessionKey) : {};
    }

    clear() {
        if (session.active) session.set(sessionKey, {});
    }
};