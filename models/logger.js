const _ = require('lodash');
const winston = require('winston');

const Parameters = require('./parameters');
const Measurements = require('./measurements');
const defaults = require('./../configuration/defaults.config.js');
const TransportFactory = require('./../factories/transport.factory.js');
const FormatterFactory = require('./../factories/formatter.factory.js');

let transports;
let formatters;
let measurements;
let parameters;

class Logger {
    constructor(name, config) {
        parameters = new Parameters();
        measurements = new Measurements();
        formatters = new FormatterFactory();
        transports = new TransportFactory();

        this.name = name;
        winston.clear();//clear winston's default transports 
        initTransports(config);
    }

    setParam(key, value) {
        parameters.set(key, value);
    }

    setManyParams(dataDictionary) {
        parameters.setMany(dataDictionary);
    }

    measure(name, subject, immediateLog) {
        let measureHandler = typeof(subject) === "function" ? measureFunction : measurePromise;
        return measureHandler(name, subject, immediateLog);
    }

    logMeasurements(msg) {
        let meta = measurements.get();
        measurements.clear();
        winston.info(msg, meta);
    }

    initTransaction(transactionId) {
        parameters.clear();
        measurements.clear();
        parameters.setTransactionId(transactionId);
    }
}

Object.setPrototypeOf(Logger.prototype, winston);

function initTransports(config) {
    _.forOwn(config, (transportConfig, transportType) => {
        let Transport = transports.get(transportType, transportConfig.module);
        let options = initTransportOptions(transportConfig);
        winston.add(Transport, options);
    });
}

function initTransportOptions(config) {
    let options = Object.assign({}, defaults, config);
    if (options.formatter) {
        const Formatter = formatters.get(config.formatter);
        let formatter = new Formatter(parameters);
        options.formatter = formatter.format;
    }
    return options;
}

function writeMeasurement(name, result, immediateLog) {
    let key = `${name}Time`;
    if (immediateLog) {
        winston.info(immediateLog, {key: result});
    }
}

function measureFunction(name, callback, immediateLog) {
    const {returnValue, time} = measurements.measure(name, callback);
    writeMeasurement(name, time, immediateLog);
    return returnValue;
}

function measurePromise(name, promise, immediateLog) {
    return measurements.measurePromise(name, promise).then(measurementResult => {
        writeMeasurement(name, measurementResult.time, immediateLog);
        return measurementResult.promiseResponse;
    });
}

module.exports = Logger;