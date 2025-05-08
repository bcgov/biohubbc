import { useCallback, useRef } from 'react';

export type AsyncFunction<AFArgs extends any[], AFResponse> = (...args: AFArgs) => Promise<AFResponse>;

export type AbortableAsyncFunction<AFArgs extends any[], AFResponse> = (
  signal: AbortSignal,
  ...args: AFArgs
) => Promise<AFResponse>;

/**
 * Wraps an async function to prevent duplicate calls if the previous call is still pending.
 *
 * Example:
 *
 * ```
 * const myAsyncFunction = useAsync(
 *   (param: number) => asyncFunction(param1)
 * )
 *
 * await myAsyncFunction(1) // calls `asyncFunction`, where param=1
 * // call 1 is pending
 * await myAsyncFunction(2) // returns pending promise from call 1
 * await myAsyncFunction(2) // returns pending promise from call 1
 * // call 1 is fulfilled
 * await myAsyncFunction(2) // calls `asyncFunction`, where param=2
 * // call 2 is pending
 * ```
 *
 * @template AFArgs `AsyncFunction` argument types.
 * @template AFResponse `AsyncFunction` response type.
 * @param {AsyncFunction<AFArgs, AFResponse>} asyncFunction the async function to wrap
 * @return {*}  {AsyncFunction<AFArgs, AFResponse>}
 */
export const useAsync = <AFArgs extends any[], AFResponse>(
  asyncFunction: (signal: AbortSignal, ...args: AFArgs) => Promise<AFResponse>
): ((...args: AFArgs) => Promise<AFResponse>) => {
  const abortControllerRef = useRef<AbortController | null>(null);

  return useCallback(
    async (...args: AFArgs) => {
      // Cancel previous
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      return asyncFunction(controller.signal, ...args);
    },
    [asyncFunction]
  );
};
