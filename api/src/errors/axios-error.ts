import axios from 'axios';

interface FormattedAxiosError extends Error {
  /**
   * The HTTP status code of the response.
   * @type {number}
   */
  status: number;
  /**
   * The status text of the response.
   * @type {string}
   */
  statusText: string;
  /**
   * The Axios error response.
   * @type {unknown}
   */
  response: unknown;
}

/**
 * Attempts to format an Axios error into a simplified object.
 *
 * @param {unknown} error - The error to format
 * @returns {*} {FormattedAxiosError} The formatted error
 */
export const formatAxiosError = (error: unknown): FormattedAxiosError => {
  if (axios.isAxiosError(error)) {
    return {
      name: 'AxiosError',
      message: error.message,
      status: error.response?.status ?? 500,
      statusText: error.response?.statusText ?? 'Internal Server Error',
      response: error.response?.data
    };
  }

  return error as FormattedAxiosError;
};
