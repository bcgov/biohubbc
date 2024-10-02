import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Get the transport types to use for the logger.
 *
 * @return {*}  {string[]}
 */
const getLoggerTransportTypes = (): string[] => {
  const transportTypes = [];

  if (process.env.npm_lifecycle_event !== 'test') {
    transportTypes.push('file');
  }

  if (process.env.NODE_ENV !== 'production') {
    transportTypes.push('console');
  }

  return transportTypes;
};

/**
 * Get or create a logger for the given `logLabel`.
 *
 * Centralized logger that uses Winston 3.x.
 *
 * Initializing the logger:
 *
 * import { getLogger } from './logger';
 * const defaultLog = getLogger('class-or-file-name');
 *
 * Usage:
 *
 * log.info({ message: 'A basic log message!' })
 *
 * log.info({ label: 'functionName', message: 'A message with a label!' })
 *
 * log.error({ label: 'functionName', message: 'An error message!:', error })
 *
 * log.debug({ label: 'functionName', message: 'A debug message!:', debugInfo1, debugInfo2 })
 *
 * ...etc
 *
 * Example Output:
 *
 * [15-09-2019 14:44:30] [info] (class-or-file-name): A basic log message!
 *
 * [15-09-2019 14:44:30] [info] (class-or-file-name): functionName - A message with a label!
 *
 * [02-12-2019 14:45:02] [error] (class-or-file-name): functionName - An error message!
 * {
 *   error: 404 Not Found
 * }
 *
 * [02-12-2019 14:46:15] [error] (class-or-file-name): functionName - A debug message!
 * {
 *   debugInfo1: 'someDebugInfo1'
 * }
 * {
 *   debugInfo2: 'someDebugInfo2'
 * }
 *
 * ...etc
 *
 * Environment Variables:
 *
 * LOG_LEVEL - Defines the level of logging that the logger will output to the console. (default: debug)
 *
 * LOG_LEVEL_FILE - Defines the level of logging that the logger will output to persistent log files. (default: debug)
 *
 * Valid logging level values (from least logging to most logging) - silent, error, warn, info, debug, silly
 *
 * @param {string} logLabel common label for the instance of the logger.
 * @returns
 */
export const getLogger = function (logLabel: string) {
  const transportTypes = getLoggerTransportTypes();

  const transports = [];

  if (transportTypes.includes('file')) {
    // Output logs to file, except when running unit tests
    transports.push(
      new DailyRotateFile({
        dirname: process.env.LOG_FILE_DIR || 'data/logs',
        filename: process.env.LOG_FILE_NAME || 'sims-api-%DATE%.log',
        datePattern: process.env.LOG_FILE_DATE_PATTERN || 'YYYY-MM-DD-HH',
        maxSize: process.env.LOG_FILE_MAX_SIZE || '50m',
        maxFiles: process.env.LOG_FILE_MAX_FILES || '10',
        level: process.env.LOG_LEVEL_FILE || 'debug',
        format: winston.format.combine(
          winston.format((info) => {
            const { timestamp, level, ...rest } = info;
            // Return the properties of info in a specific order
            return { timestamp, level, logger: logLabel, ...rest };
          })(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.prettyPrint({ colorize: false, depth: 10 })
        ),
        options: {
          // https://nodejs.org/api/fs.html#file-system-flags
          // Open file for reading and appending. The file is created if it does not exist.
          flags: 'a+',
          // https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
          // Set the file mode to be readable and writable by all users.
          mode: 0o666
        }
      })
    );
  }

  if (transportTypes.includes('console')) {
    // Output logs to console, except when running in production
    transports.push(
      new winston.transports.Console({
        level: process.env.LOG_LEVEL || 'debug',
        format: winston.format.combine(
          winston.format((info) => {
            const { timestamp, level, ...rest } = info;
            // Return the properties of info in a specific order
            return { timestamp, level, logger: logLabel, ...rest };
          })(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.prettyPrint({ colorize: true, depth: 10 })
        )
      })
    );
  }

  return winston.loggers.get(logLabel || 'default', { transports: transports });
};

export const WinstonLogLevels = ['silent', 'error', 'warn', 'info', 'debug', 'silly'] as const;

export type WinstonLogLevel = (typeof WinstonLogLevels)[number];

/**
 * Set the winston logger log level for the console transport
 *
 * @param {WinstonLogLevel} logLevel
 */
export const setLogLevel = (logLevel: WinstonLogLevel) => {
  const transportTypes = getLoggerTransportTypes();

  if (!transportTypes.includes('console')) {
    return;
  }

  // Update env var for future loggers
  process.env.LOG_LEVEL = logLevel;

  // Update console transport log level, which is the last transport in all environments
  winston.loggers.loggers.forEach((logger) => {
    logger.transports[transportTypes.length - 1].level = logLevel;
  });
};

/**
 * Set the winston logger log level for the file transport.
 *
 * @param {WinstonLogLevel} logLevel
 */
export const setLogLevelFile = (logLevelFile: WinstonLogLevel) => {
  const transportTypes = getLoggerTransportTypes();

  if (!transportTypes.includes('file')) {
    return;
  }

  // Update env var for future loggers
  process.env.LOG_LEVEL_FILE = logLevelFile;

  // Update file transport log level, which is the first transport in all environments
  winston.loggers.loggers.forEach((logger) => {
    logger.transports[0].level = logLevelFile;
  });
};
