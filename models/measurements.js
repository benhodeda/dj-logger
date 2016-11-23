const _ = require('lodash');
const cls = require('continuation-local-storage');
const ProgressLogger = require('progress-logger-js');

const measurementsKey = 'logger-measurements';
const session = cls.getNamespace('dj-logger');
const initMeasurement = {
    sum: 0,
    count: 0
};

function add(name, measurement) {
    let measurements = session.get(measurementsKey);
    measurements[name] = measurements[name] || _.clone(initMeasurement);
    measurements[name].sum += measurement;
    measurements[name].count++;
    if (!measurements[name].max || measurements[name].max < measurement) {
        measurements[name].max = measurement;
    }
    if (!measurements[name].min || measurements[name].min > measurement) {
        measurements[name].min = measurement;
    }
    session.set(measurementsKey, measurements);
}

module.exports = class Measurements {

    get() {
        let meta = {};
        let measurements = session.get(measurementsKey);
        _.forOwn(measurements, (measurement, name) => {
            const sum = measurement.sum;
            const count = measurement.count;
            meta[`${name}TotalTime`] = sum;
            meta[`${name}Count`] = count;
            meta[`${name}AvgTime`] = sum / count;
            meta[`${name}Min`] = measurement.min;
            meta[`${name}Max`] = measurement.max;
        });
        return meta;
    }

    measure(name, callback) {
        let progress = new ProgressLogger(); //start measure

        const returnValue = callback(); //Act

        progress.end();//stop measure

        //update measures
        const stats = progress.stats();
        this.add(name, stats.elapsed);

        return {
            returnValue,
            time: stats.elapsed
        };
    }

    measurePromise(name, promise) {
        const progress = new ProgressLogger(); //start measure

        return promise.then(act);

        function act(response) {
            progress.end();//stop measure

            //update measures
            const stats = progress.stats();
            this.add(name, stats.elapsed);

            return {
                promiseResponse: response,
                time: stats.elapsed
            };
        }
    }

    clear() {
        session.set(measurementsKey, {});
    }
};

