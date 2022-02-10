const winston = require("winston");
const moment = require("moment");
const TIMESTAMP_FORMAT = moment().format().trim();
const FILENAME_TIMESTAMP_FORMAT =
    `${__dirname}/../logs/${moment().format('YYYY-MM-DD').trim()}-stack-learning.log`;
const MESSAGE = Symbol.for('message');

const logFormat = entry => {
    entry[MESSAGE] = `${TIMESTAMP_FORMAT} - ${entry.level}: ${entry.message}`;
    return entry;
};

const transports = {
    console: new winston.transports.Console({
        level: "silly",
        timestamp: true
    }),

    file: new winston.transports.File({
        filename: FILENAME_TIMESTAMP_FORMAT,
        level: "debug",
        tailable: true,
        maxsize: 2.55 * 1024 * 1024 // 2.55 mb max size
    }),
};

module.exports = winston.createLogger({
    colorize: false,
    handleExceptions: true,
    format: winston.format(logFormat)(),
    transports: [
        transports.console,
        transports.file
    ]
});