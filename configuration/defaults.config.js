module.exports = {
    /* optional: splunk formatter 
     formatter: 'splunk'

     required (for file transport):
     filename: 'your log file path'
     */
    level: "debug",
    silent: false,
    colorize: false,
    maxsize: 100 * 1000 * 1024,
    maxFiles: 100,
    json: false,
    zippedArchive: false,
    fsoptions: {flags: 'a'}
};