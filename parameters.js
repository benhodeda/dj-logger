const cls = require('continuation-local-storage');
const uuid = require('node-uuid');

const session = cls.getNamespace('dj-logger');

const sessionKey = 'logger-params';

module.exports = class Parameters {
    setTransactionId(tid) {
        session.set('transactionId', tid || uuid.v4());
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
        if (session.active) return session.get(sessionKey);
        return {};
    }

    clear() {
        if (session.active) session.set(sessionKey, {});
    }
};