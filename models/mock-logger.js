class MockLogger {
    constructor() {
        this.name = "Mock-Logger";
    }

    setParam() {
    }

    setManyParams() {
    }

    measure(name, subject, immediateLog) {
        let measureHandler = typeof(subject) === "function" ? measureFunction : measurePromise;
        return measureHandler(name, subject, immediateLog);
    }

    logMeasurements() {
    }

    initTransaction() {
    }
}

function measureFunction(name, callback, immediateLog) {
    return callback();
}

function measurePromise(name, promise, immediateLog) {
    return promise;
}

module.exports = MockLogger;