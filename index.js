var continuationLocalStorage = require('continuation-local-storage');
var Duration = require('duration');
var winston = require('winston');
var moment = require('moment');
var uuid = require('node-uuid');
var _ = require('lodash');

var namespace = continuationLocalStorage.createNamespace('dj-logger');

winston.remove(winston.transports.Console);
winston.initialize = initialize;

function initialize(config) {
    var transportCreators = {
        file: createFileTransport,
        console: createConsoleTransport
    };

    winston.getParams = getParams;
    winston.addParams = addParams;
    winston.removeParams = removeParams;
    winston.addPerformance = addPerformance;
    winston.performanceInfo = performanceInfo;
    winston.partialAddParams = partialAddParams;
    winston.setTransactionId = setTransactionId;
    winston.clearPerformance = clearPerformance;
    winston.addPerformanceTime = addPerformanceTime;

    config.transports.forEach(function (transport) {
        var transportCreator = transportCreators[transport.type];
        transportCreator(transport.settings);
    });

    function createFileTransport(settings) {
        var options = {
            level: settings.level || "debug",
            silent: settings.silent || false,
            colorize: settings.colorize || false,
            filename: settings.filename,
            maxsize: settings.maxsize || 100 * 1000 * 1024,
            maxFiles: settings.maxFiles || 100,
            json: settings.json || false,
            zippedArchive: settings.zippedArchive || false,
            fsoptions: settings.fsoptions || {flags: 'a'},
            formatter: formatter,
            prettyPrint: prettyPrint
        };

        function formatter(log) {
            var logStr = 'timestamp="{timestamp}" severity="{severity}" action="{action}"';
            var logParams = {
                timestamp: moment().format("x"),
                severity: log.level.toUpperCase(),
                action: log.message
            };
            logStr = logFormat(logStr, logParams);
            return logStr + prettyPrint(log.meta);
        }

        function prettyPrint(meta) {
            var additionalParams = namespace.get('additionalParams') || {};
            var paramsCount = Object.keys(additionalParams).length;
            var isErrorMeta = meta instanceof Error;
            var metaCount = Object.keys(meta).length;

            var metaStr = "";
            if (paramsCount > 0) {
                metaStr += printParams(additionalParams, Object.keys(meta));
            }
            if (!isErrorMeta && metaCount > 0) {
                metaStr += printParams(meta);
            }
            var innerExceptionString = "";
            if (isErrorMeta) {
                innerExceptionString = printException(meta, metaCount);
            }
            return metaStr + innerExceptionString;
        }

        var printParams = function (params, filter) {
            filter = filter || [];
            var paramsStr = "";
            for (var param in params) {
                if (filter.indexOf(param) == -1 && params[param] && params[param].constructor !== Function) {
                    paramsStr += logFormat(' {param}="{value}"', {param: param, value: params[param]});
                }
            }

            return paramsStr;
        };

        function printException(exception, exceptionPropertiesCount) {
            var exceptionMessage = ' innerException="{innerException}"';
            if (exceptionPropertiesCount > 0) {
                exceptionMessage += printParams(exception);
            }
            exceptionMessage += ' stacktrace="{stacktrace}"';
            var exceptionParams = {
                innerException: exception.message,
                stacktrace: exception.stack.split('\n').join('\r\n')
            };
            return logFormat(exceptionMessage, exceptionParams);
        }

        function logFormat(string, params) {
            for (var param in params) {
                var pattern = "{" + param + "}";
                string = string.replace(pattern, params[param]);
            }
        }

        winston.add(winston.transports.File, options);
    }

    function createConsoleTransport(settings) {
        var options = {
            level: settings.level || "debug",
            silent: settings.silent || false,
            colorize: settings.colorize || false,
            json: settings.json || false
        };
        winston.add(winston.transports.Console, options);
    }

    return namespace;
}

function getParams() {
    return namespace.getParams('additionalParams');
}

function addParams(params) {
    partialAddParams(params);
}

function removeParams(params) {
    var additionalParams = namespace.getParams('additionalParams');
    for (var prop in params) {
        if (params[prop].constructor !== Function) {
            delete additionalParams[prop];
        }
    }
    namespace.set('additionalParams', additionalParams);
}

function partialAddParams(params, subset) {
    var additionalParams = namespace.getParams('additionalParams');
    subset = subset || Object.keys(params);
    for (var prop in params) {
        if (subset.indexOf(prop) !== -1 && params[prop] && params[prop].constructor !== Function) {
            additionalParams[prop] = params[prop];
        }
    }
    namespace.set('additionalParams', additionalParams);
}

function performanceInfo(message, meta) {
    var performance = namespace.getParams('performance');
    for (var prop in performance) {
        if (performance[prop] && performance[prop].constructor !== Function) {
            var count = performance[prop].length;
            if (count === 1) {
                meta[prop] = performance[prop];
            } else {
                meta[prop + 'Count'] = count;
                meta[prop + 'Min'] = _.min(performance[prop]);
                meta[prop + 'Max'] = _.max(performance[prop]);
                meta[prop + 'Avg'] = _.reduce(performance[prop], function (memo, num) {
                        return memo + num;
                    }, 0) / count;
            }
        }
    }
    clearPerformance();
    winston.info(message, meta);
}

function addPerformance(key, value) {
    var performance = namespace.getParams('performance');
    if (!!performance[key]) {
        performance[key].push(value);
    } else {
        performance[key] = [value];
    }
    namespace.set('performance', performance);
}

function addPerformanceTime(key, startTime) {
    addPerformance(key, (new Duration(startTime)).milliseconds);
}

function clearPerformance() {
    namespace.set('performance', {});
}

function setTransactionId(tid) {
    namespace.set('additionalParams', {
        transactionId: tid
    });
    namespace.set('tid', tid);
}

function enrichLogger(system, scope, callback) {
    return function (req, res, next) {
        namespace.bindEmitter(req);
        namespace.bindEmitter(res);
        namespace.run(function () {
            setTransactionId(req.headers["transaction-id"] || uuid.v4());
            clearPerformance();
            addParams({
                system: system,
                scope: scope,
                section: "undefined",
                user: req.headers.user || "undefined",
                requestUrl: req.url
            });
            if (callback) {
                callback();
            }
            next();
        })
    }
}

function getLogger() {
    return winston;
}

module.exports = {
    getLogger: getLogger,
    enrichLoggerMiddleware: enrichLogger
};