import axios from 'axios';

interface FormattedAxiosError extends Error {
  /**
   * The HTTP status code of the response.
   * @type {number}
   */
  status: number;
  /**
   * The content of the error.
   * @type {unknown}
   */
  content: unknown;
}

/**
 * Format an Axios error into a simplified object.
 *
 * @param {unknown} error - The error to format
 * @returns {*} {FormattedAxiosError} The formatted error
 */
export const formatAxiosError = (error: unknown): FormattedAxiosError => {
  if (axios.isAxiosError(error)) {
    return {
      name: error.name,
      message: error.message,
      status: error.response?.status ?? 500,
      content: error.response?.data ?? error.request
    };
  }

  return error as FormattedAxiosError;
};
