let _ = require('lodash');
let winston = require('winston');
const ProgressLogger = require('progress-logger-js');

const Parameters = require('./parameters');
const Measurements = require('./measurements');
const defaults = require('./configuration/defaults.config');
const TransportFactory = require('./factories/transport.factory.js');
const FormatterFactory = require('./factories/formatter.factory.js');

let transports;
let formatters;
let measurement;
let parameters;

class Logger {
    constructor(name, config) {
        parameters = new Parameters();
        measurement = new Measurements();
        formatters = new FormatterFactory();
        transports = new TransportFactory();

        this.name = name;
        winston.clear();
        _.forOwn(config, function (transportConfig, transport) {
            let Transport = transports.get(transport, transportConfig.module);
            let options = initTransportOptions(transportConfig);
            winston.add(Transport, options);
        });
    }

    set(key, value) {
        parameters.set(key, value);
    }

    sets(data) {
        parameters.sets(data);
    }

    measure(name, callback, immediateLog = false) {
        let progress = new ProgressLogger(); //start measure

        callback(); //Act

        progress.end();//stop measure

        //update measures
        const stats = progress.stats();
        measurement.add(name, stats.elapsed);

        let key = `${name}Time`;
        if (immediateLog) {
            winston.info("Operation finished.", {key: stats.elapsed});
        }
    }

    measurePromise(name, promise, immediateLog = false) {
        let progress = new ProgressLogger(); //start measure

        return promise.then((result) => {
            progress.end();//stop measure

            //update measures
            const stats = progress.stats();
            measurement.add(name, stats.elapsed);

            let key = `${name}Time`;
            if (immediateLog) winston.info("Operation finished.", {key: stats.elapsed});

            return result;
        }); //Act

    }

    logMeasurements(msg) {
        let meta = measurement.get();
        measurement.clear();
        winston.info(msg, meta);
    }

    initTransaction(tid) {
        parameters.clear();
        measurement.clear();
        parameters.setTransactionId(tid);
    }
}

Object.setPrototypeOf(Logger.prototype, winston);

function initTransportOptions(config) {
    let options = Object.assign({}, defaults, config);
    if (config.formatter) {
        const Formatter = formatters.get(config.formatter);
        let formatter = new Formatter(parameters);
        options.formatter = formatter.format;
    }
    return options;
}

module.exports = Logger;