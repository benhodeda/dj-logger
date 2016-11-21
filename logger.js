const FormatterFactory = require('./factories/formatter.factory.js');
const TransportFactory = require('./factories/transport.factory.js');
const defaults = require('./configuration/defaults.config');
const ProgressLogger = require('progress-logger-js');
const Measurements = require('./measurements');
const Parameters = require('./parameters');
let winston = require('winston');
let _ = require('lodash');

var transports;
var formatters;

var measurement;
var parameters;

class Logger {
    constructor(name, config) {
        transports = new TransportFactory();
        formatters = new FormatterFactory();
        measurement = new Measurements();
        parameters = new Parameters();

        this.name = name;
        winston.clear();
        _.forOwn(config, function (transportConfig, transport) {
            const Transport = transports.get(transport, transportConfig.module);
            let options = Object.assign({}, defaults, transportConfig);
            if (transportConfig.formatter) {
                const Formatter = formatters.get(transportConfig.formatter);
                let formatter = new Formatter(parameters);
                options.formatter = formatter.format;
            }
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
        if (immediateLog) winston.info("Operation finished.", {key: stats.elapsed});
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

module.exports = Logger;