const Formatter = require('./formatter.js');
const moment = require('moment');
const _ = require('lodash');

module.exports = class SplunkFormatter extends Formatter {
    format(log) {
        super.format(log);
        let logString = `timestamp="${moment().format("x")}" severity="${log.level.toUpperCase()}" action="${log.message}"`;

        _.forOwn(log.meta, function (value, key) {
            if (value && value.constructor !== Function) {
                value = typeof(value) === "object" ? JSON.stringify(value) : value;
                logString += ` ${key}="${value}"`;
            }
        });

        return logString;
    }
};