'use strict';

var _ = require('lodash'),
  config = require('../config'),
  chalk = require('chalk'),
  fileStreamRotator = require('file-stream-rotator'),
  fs = require('fs'),
  log4js = require('log4js');

// list of valid formats for the logging
var validFormats = ['combined', 'common', 'dev', 'short', 'tiny'];
var log4jsConfig = {
  appenders: [
    { type: 'console' },
    {
      type: 'dateFile',
      category: ['System'],
      filename: 'logs/system.log',
      pattern: '.yyyy-MM-dd',
      alwaysIncludePattern: true
    }, {
      type: 'dateFile',
      category: ['Debug'],
      filename: 'logs/debug.log',
      pattern: '.yyyy-MM-dd',
      alwaysIncludePattern: true
    }
  ],
  'replaceConsole': true
  // logger.trace('Entering cheese testing');
  // logger.debug('Got cheese.');
  // logger.info('Cheese is Gouda.');
  // logger.warn('Cheese is quite smelly.');
  // logger.error('Cheese is too ripe!');
  // logger.fatal('Cheese was breeding ground for listeria.');
};
log4js.configure({
  appenders: {
    systemLog: {
      type: 'dateFile',
      filename: 'logs/system.log',
      pattern: '.yyyy-MM-dd',
      alwaysIncludePattern: true
    },
    debugLog: {
      type: 'dateFile',
      filename: 'logs/debug.log',
      pattern: '.yyyy-MM-dd',
      alwaysIncludePattern: true
    }
  },
  categories: {
    system: { appenders: ['systemLog'], level: 'error' },
    debug: { appenders: ['debugLog'], level: 'trace' },
    console: { appenders: ['console'], level: 'trace' },
    default: { appenders: ['console', 'systemLog'], level: 'trace' }
  }
  // logger.trace('Entering cheese testing');
  // logger.debug('Got cheese.');
  // logger.info('Cheese is Gouda.');
  // logger.warn('Cheese is quite smelly.');
  // logger.error('Cheese is too ripe!');
  // logger.fatal('Cheese was breeding ground for listeria.');
});
/**
 * MORGAN LOG FORMAT
 */
function getLogFormat() {
  var format = config.log && config.log.format ? config.log.format.toString() : 'combined';

  // make sure we have a valid format
  if (!_.includes(validFormats, format)) {
    format = 'combined';

    if (process.env.NODE_ENV !== 'test') {
      console.log();
      console.log(chalk.yellow('Warning: An invalid format was provided. The logger will use the default format of "' + format + '"'));
      console.log();
    }
  }

  return format;
}

/**
 * MORGAN LOG OPTIONS
 */
function getLogOptions() {
  var options = config.log && config.log.options ? _.clone(config.log.options, true) : {};

  // check if the current environment config has the log stream option set
  if (_.has(options, 'stream')) {

    try {

      // check if we need to use rotating logs
      if (_.has(options, 'stream.rotatingLogs') && options.stream.rotatingLogs.active) {

        if (options.stream.rotatingLogs.fileName.length && options.stream.directoryPath.length) {

          // ensure the log directory exists
          if (!fs.existsSync(options.stream.directoryPath)) {
            fs.mkdirSync(options.stream.directoryPath);
          }

          options.stream = fileStreamRotator.getStream({
            filename: options.stream.directoryPath + '/' + options.stream.rotatingLogs.fileName,
            frequency: options.stream.rotatingLogs.frequency,
            verbose: options.stream.rotatingLogs.verbose
          });

        } else {
          // throw a new error so we can catch and handle it gracefully
          throw new Error('An invalid fileName or directoryPath was provided for the rotating logs option.');
        }

      } else {

        // create the WriteStream to use for the logs
        if (options.stream.fileName.length && options.stream.directoryPath.length) {

          // ensure the log directory exists
          if (!fs.existsSync(options.stream.directoryPath)) {
            fs.mkdirSync(options.stream.directoryPath);
          }

          options.stream = fs.createWriteStream(options.stream.directoryPath + '/' + config.log.options.stream.fileName, { flags: 'a' });
        } else {
          // throw a new error so we can catch and handle it gracefully
          throw new Error('An invalid fileName or directoryPath was provided for stream option.');
        }
      }
    } catch (err) {

      // remove the stream option
      delete options.stream;

      if (process.env.NODE_ENV !== 'test') {
        console.log();
        console.log(chalk.red('An error has occured during the creation of the WriteStream. The stream option has been omitted.'));
        console.log(chalk.red(err));
        console.log();
      }
    }
  }

  return options;
}

// build logger service
var logger = {
  morganLog: {
    getFormat: getLogFormat, // log format to use
    getOptions: getLogOptions // log options to use
  },
  log4jLog: {
    system: log4js.getLogger('system'),
    debug: log4js.getLogger('debug'),
  }
};

// export the logger service
module.exports = logger;
