import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { getRequestId, getRequestUser } from './async-request-storage';

const DEFAULT_LOGGER = 'default';

export type CustomLogger = {
  error: (params: CustomLoggerParams) => void;
  warn: (params: CustomLoggerParams) => void;
  info: (params: CustomLoggerParams) => void;
  debug: (params: CustomLoggerParams) => void;
  silly: (params: CustomLoggerParams) => void;
};

export type CustomLoggerParams = {
  label?: string;
  message?: string;
  error?: any;
  [key: string]: any;
};

export const WinstonLogLevels = ['silent', 'error', 'warn', 'info', 'debug', 'silly'] as const;

export type WinstonLogLevel = (typeof WinstonLogLevels)[number];

/**
 * Get a singleton logger.
 *
 * Wraps the winston logger to provide a common interface for logging.
 *
 * @example
 *
 * Initialization:
 *
 * import { getLogger } from './logger';
 *
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
 * Example Output:
 *
 * {
 *    requestId: '46d544ed-9d70-499a-888c-1a1c67fb095',
 *    timestamp: '2025-02-21 16:54:18',
 *    requestUser: 'SBRULE',
 *    level: 'info',
 *    logger: 'class-logger',
 *    label: 'functionName',
 *    message: 'Log message!',
 *    metadata: {
 *      id: '123',
 *    }
 * }
 *
 * @param {string} logLabel common label for the instance of the logger.
 * @return {*}  {CustomLogger}
 */
export const getLogger = (logLabel: string): CustomLogger => {
  const logger = _getOrCreateLoggerSingleton(DEFAULT_LOGGER);

  return {
    error: (params: CustomLoggerParams) => logger.error(..._getLoggerParameters(logLabel, params)),
    warn: (params: CustomLoggerParams) => logger.warn(..._getLoggerParameters(logLabel, params)),
    info: (params: CustomLoggerParams) => logger.info(..._getLoggerParameters(logLabel, params)),
    debug: (params: CustomLoggerParams) => logger.debug(..._getLoggerParameters(logLabel, params)),
    silly: (params: CustomLoggerParams) => logger.silly(..._getLoggerParameters(logLabel, params))
  };
};

/**
 * Helper function for `getLogger` to normalize the logger parameters to ensure 'message' is defined.
 *
 * Note: This fixes a strange issue with winston combining the message and metadata into a single object,
 * when the message is NOT included in the params.
 *
 * @param {string} logLabel The common label for the logger instance.
 * @param {CustomLoggerParams} params The logger parameters.
 * @return {*}  {[string, CustomLoggerParams]} The normalized logger parameters.
 */
export const _getLoggerParameters = (logLabel: string, params: CustomLoggerParams): [string, CustomLoggerParams] => {
  if (params.message) {
    // Remove 'message' from params and return it as the first element
    const { message, ...restParams } = params;

    return [message, { logger: logLabel, ...restParams }];
  }

  // Return 'unknown' as log message when 'message' is not provided
  return ['unknown', { logger: logLabel, ...params }];
};

/**
 * Get the transport types to use for the logger.
 *
 * @return {*}  {string[]}
 */
const _getLoggerTransportTypes = (): string[] => {
  const transportTypes = ['console'];

  // Do not output logs to file when running unit tests
  // Note: Both lifecycle events are needed to prevent log files ie: `npm run test` or `npm run test-watch`
  if (process.env.npm_lifecycle_event !== 'test' && process.env.npm_lifecycle_event !== 'test-watch') {
    transportTypes.push('file');
  }

  return transportTypes;
};

/**
 * Get the log format for the winston logger.
 *
 * @return {*}  {winston.Logform.Format}
 */
export const _getLogFormat = (): winston.Logform.Format => {
  return winston.format.combine(
    // Fill the metadata with all the properties except the ones listed
    winston.format.metadata({ fillExcept: ['message', 'level', 'logger', 'label'] }),
    // Organize the log message structure
    winston.format((info) => ({
      // NOTE: Would adding a unique log id be useful? Different from the request id which is shared across async requests
      requestId: getRequestId(), // 'd3d3b4d3-7b3d-4b3d-8b3d-3d3b4d3b3d3b'
      timestamp: info.timestamp, // '2025-02-04 14:05:24'
      user: getRequestUser(), // 'SBRULE'
      level: info.level, // 'DEBUG'
      logger: info.logger, // 'app-logger'
      label: info.label, // 'label/function name/etc.'
      message: info.message, // 'A log message!'
      metadata: info.metadata // { ... }
    }))(),
    // Format the log timestamp
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    // Colorize the log message and limit the depth of the metadata object
    winston.format.prettyPrint({ colorize: true, depth: 10 })
  );
};

/**
 * Get or create a singleton logger instance.
 *
 * @param {string} loggerName The name of the logger instance.
 * @return {*}  {winston.Logger}
 */
export const _getOrCreateLoggerSingleton = function (loggerName: string): winston.Logger {
  const hasLogger = winston.loggers.has(loggerName);

  if (hasLogger) {
    // Return the existing logger instance
    return winston.loggers.get(loggerName);
  }

  const transportTypes = _getLoggerTransportTypes();

  const transports = [];

  if (transportTypes.includes('file')) {
    // Output logs to file, except when running unit tests
    transports.push(
      new DailyRotateFile({
        dirname: process.env.LOG_FILE_DIR || 'data/logs',
        filename: process.env.LOG_FILE_NAME || 'sims-api.log',
        datePattern: process.env.LOG_FILE_DATE_PATTERN || 'YYYY-MM-DD',
        maxSize: process.env.LOG_FILE_MAX_SIZE || '49m',
        maxFiles: process.env.LOG_FILE_MAX_FILES || '10',
        level: process.env.LOG_LEVEL_FILE || 'debug',
        format: _getLogFormat(),
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
        format: _getLogFormat()
      })
    );
  }

  // Create new logger instance
  return winston.loggers.add(loggerName, { transports: transports });
};

/**
 * Set the winston logger log level for the console transport
 *
 * @param {WinstonLogLevel} consoleLogLevel
 */
export const setLogLevel = (consoleLogLevel: WinstonLogLevel): void => {
  const transportTypes = _getLoggerTransportTypes();

  if (!transportTypes.includes('console')) {
    return;
  }

  // Update env var for future loggers
  process.env.LOG_LEVEL = consoleLogLevel;

  // Update console transport log level, which is the last transport in all environments
  winston.loggers.loggers.forEach((logger) => {
    logger.transports[transportTypes.length - 1].level = consoleLogLevel;
  });
};

/**
 * Set the winston logger log level for the file transport.
 *
 * @param {WinstonLogLevel} fileLogLevel
 */
export const setLogLevelFile = (fileLogLevel: WinstonLogLevel): void => {
  const transportTypes = _getLoggerTransportTypes();

  if (!transportTypes.includes('file')) {
    return;
  }

  // Update env var for future loggers
  process.env.LOG_LEVEL_FILE = fileLogLevel;

  // Update file transport log level, which is the first transport in all environments
  winston.loggers.loggers.forEach((logger) => {
    logger.transports[0].level = fileLogLevel;
  });
};
