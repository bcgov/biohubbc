import winston from 'winston';

/**
 * Logger input.
 *
 * @export
 * @interface ILoggerMessage
 * @extends {winston.Logform.TransformableInfo}
 */
export interface ILoggerMessage extends winston.Logform.TransformableInfo {
  timestamp?: string; // Optionally overwrite the default timestamp
  label?: string; // Add a label to this message (generally the name of the parent function)
  error?: Error; // An optional error to display
}

/**
 * Checks if the value provided is an object.
 *
 * @param {*} obj
 * @returns {boolean} True if the value is an object, false otherwise.
 */
export const isObject = (item: any): boolean => {
  return !!(item && typeof item === 'object');
};

/**
 * Checks if the value provided is an object with enumerable keys (ignores symbols).
 *
 * @param {*} obj
 * @returns {boolean} True if the value is an object with enumerable keys, false otherwise.
 */
export const isObjectWithkeys = (item: any): boolean => {
  return isObject(item) && !!Object.keys(item).length;
};

/**
 * Pretty stringify.
 *
 * @param {any} item
 * @return {*}  {string}
 */
export const prettyPrint = (item: any): string => {
  return JSON.stringify(item, undefined, 2);
};

/**
 * Returns a printf function.
 *
 * @param {string} logLabel
 * @return {*}  {((args: ILoggerMessage) => string)}
 */
export const getPrintfFunction = (logLabel: string): ((args: ILoggerMessage) => string) => {
  return ({ timestamp, level, label, message, error, ...other }: ILoggerMessage) => {
    const optionalLabel = (label && ` ${label} -`) || '';

    const logMessage = (message && ((isObject(message) && `${prettyPrint(message)}`) || message)) || '';

    const optionalError = (error && ((isObjectWithkeys(error) && `\n${prettyPrint(error)}`) || `\n${error}`)) || '';

    const optionalOther = (other && isObjectWithkeys(other) && `\n${JSON.stringify(other, undefined, 2)}`) || '';

    return `[${timestamp}] (${level}) (${logLabel}):${optionalLabel} ${logMessage} ${optionalError} ${optionalOther}`;
  };
};

/**
 * Get or create a logger for the given logLabel.
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
 * Valid `LOG_LEVEL` values (from least logging to most logging) (default: info):
 * silent, error, warn, info, debug, silly
 *
 * @param {string} logLabel common label for the instance of the logger.
 * @returns
 */
export const getLogger = function (logLabel: string) {
  return winston.loggers.get(logLabel || 'default', {
    transports: [
      new winston.transports.Console({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.colorize(),
          winston.format.printf(getPrintfFunction(logLabel))
        )
      })
    ]
  });
};
