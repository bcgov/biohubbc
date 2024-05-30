type LogIfDevelopmentParams = {
  /**
   * The label to use in the log message.
   *
   * @type {string}
   */
  label?: string;
  /**
   * The message to log.
   *
   * @type {string}
   */
  message?: string;
  /**
   * An array of additional arguments to log.
   *
   * @type {((string | object)[])}
   */
  args?: (string | object)[];
};

/**
 * Logs to the console if NODE_ENV = 'development'. Does nothing otherwise.
 *
 * @param {LogIfDevelopmentParams} params
 * @return {*}
 */
export const logIfDevelopment = (params: LogIfDevelopmentParams) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.debug(params.label, params.message, JSON.stringify(params.args, null, 2));
};

/**
 * Wraps a callback, logging the arguments to the console if NODE_ENV = 'development'.
 *
 * @template T
 * @param {T} callback The callback to wrap.
 * @param {string} label The label to use in the log message.
 * @return {*} Returns a function that calls the original callback.
 */
export const logCallbackIfDevelopment = <T extends (...args: any[]) => any>(callback: T, label: string) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    logIfDevelopment({ label, message: 'args', args });

    return callback(...args);
  };
};
