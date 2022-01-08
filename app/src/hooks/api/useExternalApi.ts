import { AxiosInstance, CancelTokenSource } from 'axios';

/**
 * Returns a set of methods for working with external APIs.
 *
 * Note: Should not be used for internal Restoration Tracker API calls, as these methods will not include any auth tokens in the
 * request.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported methods for making external API calls.
 */
const useExternalApi = (axios: AxiosInstance) => {
  /**
   * Generic `GET` for a given `url`.
   *
   * @template T type of the response (optional)
   * @param {string} url url to make a `GET` request to
   * @param {CancelTokenSource} [cancelTokenSource] Cancel token to manually cancel the request (optional)
   * @return {Promise<T=any>} A promise that resolves with the response data
   */
  const get = async <T = any>(url: string, cancelTokenSource?: CancelTokenSource): Promise<T> => {
    const { data } = await axios.get(url, { cancelToken: cancelTokenSource?.token });

    return data;
  };

  /**
   * Generic `POST` for a given `url`.
   *
   * @template T type of the response (optional)
   * @param {string} url url to make a `POST` request to
   * @param {any} body request body
   * @param {CancelTokenSource} [cancelTokenSource] Cancel token to manually cancel the request (optional)
   * @return {Promise<T=any>} A promise that resolves with the response data
   */
  const post = async <T = any>(url: string, body: any, cancelTokenSource?: CancelTokenSource): Promise<T> => {
    const { data } = await axios.post(url, body, { cancelToken: cancelTokenSource?.token });

    return data;
  };

  return {
    get,
    post
  };
};

export default useExternalApi;
