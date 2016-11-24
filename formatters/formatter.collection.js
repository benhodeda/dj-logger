const Formatter = require('./formatter');
const SplunkFormatter = require('./splunk-formatter');

module.exports = {
    interface: Formatter,
    splunk: SplunkFormatter
};