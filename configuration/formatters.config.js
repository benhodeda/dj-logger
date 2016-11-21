const Formatter = require('../formatters/formatter');
const SplunkFormatter = require('../formatters/splunkFormatter');

module.exports = {
    interface: Formatter,
    splunk: SplunkFormatter
};