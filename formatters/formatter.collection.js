const Formatter = require('./formatter');
const SplunkFormatter = require('./splunkFormatter');

module.exports = {
    interface: Formatter,
    splunk: SplunkFormatter
};