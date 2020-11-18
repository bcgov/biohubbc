'use strict';

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
  label: string; // Add a label to this message (generally the name of the parent function)
  error?: Error; // An optional error to display
}

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
 * log.info({ label: 'functionName', message: 'Some info!' })
 *
 * log.error({ label: 'functionName', message: 'An error!:', error })
 *
 * log.debug({ label: 'functionName', message: 'A debug message!:', debugInfo1, debugInfo2 })
 *
 * ...etc
 *
 * Example Output:
 *
 * [15-09-2019 14:44:30] [info] (class-or-file-name): functionName - Some info!
 *
 * [02-12-2019 14:45:02] [error] (class-or-file-name): functionName - An error!
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
 * error, warn, info, debug
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
          winston.format.printf(({ timestamp, level, label, message, error, ...other }: ILoggerMessage) => {
            const optionalLabel = (label && ` ${label} -`) || '';
            const optionalError = (error && `\n${error}`) || '';
            const optionalOther =
              (other && Object.keys(other).length && `\n${JSON.stringify(other, undefined, 2)}`) || '';
            return `[${timestamp}] (${level}) (${logLabel}):${optionalLabel} ${message} ${optionalError} ${optionalOther}`;
          })
        )
      })
    ]
  });
};
