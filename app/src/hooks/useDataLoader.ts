import { useCallback, useMemo, useState } from 'react';
import { AsyncFunction, useAsync } from './useAsync';
import useIsMounted from './useIsMounted';

export type DataLoader<AFArgs extends any[], AFResponse = unknown, AFError = unknown> = {
  /**
   * The response of the `fetchData` call.
   *
   * @type {(AFResponse | undefined)}
   */
  data: AFResponse | undefined;
  /**
   * The error caught if the `fetchData` call throws.
   *
   * @type {(AFError | unknown)}
   */
  error: AFError | unknown;
  /**
   * `true` if the `fetchData` function is currently executing.
   *
   * @type {boolean}
   */
  isLoading: boolean;
  /**
   * `true` if the `fetchData` function has finished executing.
   *
   * @type {boolean}
   */
  isReady: boolean;
  /**
   * `true` if the `fetchData` function has been called at least one time.
   *
   * @type {boolean}
   */
  hasLoaded: boolean;
  /**
   * Executes the `fetchData` function once, only if it has never been called before. Does nothing if called again.
   */
  load: (...args: AFArgs) => Promise<AFResponse | undefined>;
  /**
   * Executes the `fetchData` function again.
   */
  refresh: (...args: AFArgs) => Promise<AFResponse | undefined>;
  /**
   * Clears any errors caught from a failed `fetchData` call.
   */
  clearError: () => void;

  /**
   * Clears any data as if the loader was just initialized.
   */
  clearData: () => void;
};

/**
 * Hook that wraps an async function.
 *
 * Note: Runs each time `refresh` is called.
 *
 * Note: This hook will prevent additional calls to `fetchData` if an existing call is in progress.
 *
 * @export
 * @template AFArgs `AsyncFunction` argument types.
 * @template AFResponse `AsyncFunction` response type.
 * @template AFError `AsyncFunction` error type.
 * @param {AsyncFunction<AFArgs, AFResponse>} fetchData An async function.
 * @param {((error: AFError | unknown) => void)} [onError] An optional error handler function that will be called if the
 * `fetchData` function throws an error.
 * - If set to `true`, the `fetchData` function will run on initial load, and each time `refresh` is called.
 * - If set to `false` the `fetchData` function will run each time `refresh` is called.
 * @return {*}  {DataLoader<AFArgs, AFResponse, AFError>}
 */
export default function useDataLoader<AFArgs extends any[], AFResponse = unknown, AFError = unknown>(
  fetchData: AsyncFunction<AFArgs, AFResponse>,
  onError?: (error: AFError | unknown) => void
): DataLoader<AFArgs, AFResponse, AFError> {
  const [data, setData] = useState<AFResponse>();
  const [error, setError] = useState<AFError | unknown>();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [oneTimeLoad, setOneTimeLoad] = useState(false);

  const isMounted = useIsMounted();

  const getData = useAsync(fetchData);

  const loadData = useCallback(
    async (...args: AFArgs): Promise<AFResponse | undefined> => {
      try {
        setIsLoading(true);
        setError(undefined);
        setIsReady(false);

        const response = await getData(...args);

        if (!isMounted()) {
          return;
        }

        setData(response);

        return response;
      } catch (error) {
        if (!isMounted()) {
          return;
        }

        setError(error);
        setIsLoading(false);

        onError?.(error);
      } finally {
        if (isMounted()) {
          setIsLoading(false);
          setIsReady(true);
          setHasLoaded(true);
        }
      }
    },
    [getData, isMounted, onError]
  );

  const load = useCallback(
    async (...args: AFArgs) => {
      if (oneTimeLoad) {
        return data;
      }

      setOneTimeLoad(true);
      return loadData(...args);
    },
    [data, loadData, oneTimeLoad]
  );

  const refresh = useCallback(
    async (...args: AFArgs) => {
      // Clear previous error/loading state
      setError(undefined);
      setIsLoading(false);
      setIsReady(false);
      // Call loadData to fetch new data
      return loadData(...args);
    },
    [loadData]
  );

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  const clearData = useCallback(() => {
    setData(undefined);
    setError(undefined);
    setIsLoading(false);
    setIsReady(false);
    setHasLoaded(false);
    setOneTimeLoad(false);
  }, []);

  return useMemo(
    () => ({
      data,
      error,
      isLoading,
      isReady,
      hasLoaded,
      load,
      refresh,
      clearError,
      clearData
    }),
    [clearData, clearError, data, error, hasLoaded, isLoading, isReady, load, refresh]
  );
}
