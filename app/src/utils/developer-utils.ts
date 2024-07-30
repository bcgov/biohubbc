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
  if (import.meta.env.NODE_ENV !== 'development') {
    return;
  }

  console.debug(params.label, params.message, JSON.stringify(params.args, null, 2));
};
