const SplunkFormatter = require('../formatters/splunkFormatter');
const Formatter = require('../formatters/formatter');

module.exports = {
    interface: Formatter,
    splunk: SplunkFormatter
};