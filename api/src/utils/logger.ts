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
 *   timestamp: '2025-02-04 14:05:24',
 *   level: 'debug',
 *   message: {
 *     logger: 'class-or-file-name',
 *     label: 'functionName',
 *     message: 'An error message!:',
 *     error: {...}
 *   }
 * }
 *
 * @param {string} logLabel common label for the instance of the logger.
 * @return {*}  {CustomLogger}
 */
export const getLogger = (logLabel: string): CustomLogger => {
  const logger = _getOrCreateLoggerSingleton(DEFAULT_LOGGER);

  return {
    error: (params: CustomLoggerParams) =>
      logger.error({
        requestId: getRequestId(),
        user: getRequestUser(),
        logger: logLabel,
        ...params
      }),
    warn: (params: CustomLoggerParams) =>
      logger.warn({
        requestId: getRequestId(),
        requestUser: getRequestUser(),
        logger: logLabel,
        ...params
      }),
    info: (params: CustomLoggerParams) =>
      logger.info({
        requestId: getRequestId(),
        requestUser: getRequestUser(),
        logger: logLabel,
        ...params
      }),
    debug: (params: CustomLoggerParams) =>
      logger.debug({
        requestId: getRequestId(),
        requestUser: getRequestUser(),
        logger: logLabel,
        ...params
      }),
    silly: (params: CustomLoggerParams) =>
      logger.silly({
        requestId: getRequestId(),
        requestUser: getRequestUser(),
        logger: logLabel,
        ...params
      })
  };
};

/**
 * Get the transport types to use for the logger.
 *
 * @return {*}  {string[]}
 */
const getLoggerTransportTypes = (): string[] => {
  const transportTypes = [];

  // Do not output logs to file when running unit tests
  // Note: Both lifecycle events are needed to prevent log files ie: `npm run test` or `npm run test-watch`
  if (process.env.npm_lifecycle_event !== 'test' && process.env.npm_lifecycle_event !== 'test-watch') {
    transportTypes.push('file');
  }

  if (process.env.NODE_ENV !== 'production') {
    transportTypes.push('console');
  }

  return transportTypes;
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

  const transportTypes = getLoggerTransportTypes();

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
        format: winston.format.combine(
          getCustomLogFormat(),
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
          getCustomLogFormat(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.prettyPrint({ colorize: true, depth: 10 })
        )
      })
    );
  }

  // Create new logger instance
  return winston.loggers.add(loggerName, { transports: transports });
};

export const getCustomLogFormat = (): winston.Logform.Format => {
  const customFormat = winston.format((info) => {
    //TODO: Mac: Replace this with the correct format
    return {
      requestId: info.requestId,
      timestamp: info.timestamp,
      requestUser: info.requestUser,
      logger: info.logger,
      label: info.label,
      level: info.level,
      message: info.message
    };
  });

  return customFormat();
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
