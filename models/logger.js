const _ = require('lodash');
const winston = require('winston');

const Parameters = require('./parameters');
const Measurements = require('./measurements');
const defaults = require('./../configuration/defaults.config.json');
const TransportFactory = require('./../factories/transport.factory.js');
const FormatterFactory = require('./../factories/formatter.factory.js');
const defaultLoggerConfig = require('../configuration/defaultLogger.config.json');

const _transports = Symbol('transports');
const _formatters = Symbol('formatters');
const _measurements = Symbol('measurements');
const _parameters = Symbol('parameters');

class Logger {
    constructor(name, config = defaultLoggerConfig, parameters = new Parameters(), measurements = new Measurements(),
                formatterFactory = new FormatterFactory(), transportFactory = new TransportFactory()) {
        this[_parameters] = parameters;
        this[_measurements] = measurements;
        this[_formatters] = formatterFactory;
        this[_transports] = transportFactory;

        this.name = name;
        winston.clear(); //clear winston's default transports
        initTransports.call(this, config);
    }

    setParam(key, value) {
        this[_parameters].set(key, value);
    }

    setManyParams(dataDictionary) {
        this[_parameters].setMany(dataDictionary);
    }

    measure(name, subject, immediateLog) {
        let measureHandler = typeof (subject) === "function" ? measureFunction : measurePromise;
        return measureHandler.call(this, name, subject, immediateLog);
    }

    logMeasurements(msg) {
        let meta = this[_measurements].get();
        this[_measurements].clear();
        winston.info(msg, meta);
    }

    getTransactionId() {
        return this[_parameters].getTransactionId();
    }

    initTransaction(transactionId) {
        this[_parameters].clear();
        this[_measurements].clear();
        this[_parameters].setTransactionId(transactionId);
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
        const Formatter = this[_formatters].get(config.formatter);
        let formatter = new Formatter(this[_parameters]);
        options.formatter = formatter.format;
    }
    return options;
}

function writeMeasurement(name, result, immediateLog) {
    let key = `${name}Time`;
    if (immediateLog) {
        let param = {};
        param[key] = result;
        winston.info(immediateLog, param);
    }
}

function measureFunction(name, callback, immediateLog) {
    const {
        returnValue,
        time
    } = this[_measurements].measure(name, callback);
    writeMeasurement(name, time, immediateLog);
    return returnValue;
}

function measurePromise(name, promise, immediateLog) {
    return this[_measurements].measurePromise(name, promise).then(measurementResult => {
        writeMeasurement(name, measurementResult.time, immediateLog);
        return measurementResult.promiseResponse;
    });
}

module.exports = Logger;
