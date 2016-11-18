const cls = require('continuation-local-storage');
let _ = require('lodash');

const session = cls.getNamespace('dj-logger');

const initMeasurement = {
    sum: 0,
    count: 0
};
const sessionKey = 'logger-measurements';

module.exports = class Measurements {

    add(name, measurement) {
        let measurements = session.get(sessionKey);
        measurements[name] = measurements[name] || initMeasurement;
        measurements[name].sum += measurement;
        measurements[name].count++;
        session.set(sessionKey, measurements);
    }

    get() {
        let meta = {};
        let measurements = session.get(sessionKey);
        _.forOwn(measurements, function (measurement, name) {
            const sum = measurement.sum;
            const count = measurement.count;
            if (count === 1) {
                meta[`${name}Time`] = sum;
            } else {
                meta[`${name}TotalTime`] = sum;
                meta[`${name}Count`] = count;
                meta[`${name}AvgTime`] = sum / count;
            }
        });
        return meta;
    }

    clear() {
        session.set(sessionKey, {});
    }
};