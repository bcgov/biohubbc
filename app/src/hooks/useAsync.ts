import { useRef } from 'react';

export type AsyncFunction<Q extends any[], R> = (...args: Q) => Promise<R>;

export type WrappedAsyncFunction<Q extends any[], S> = (...args: Q) => Promise<S>;

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
 * (call 1 is pending)
 * await myAsyncFunction(2) // returns promise from call 1
 * (call 1 is fulfilled)
 * await myAsyncFunction(2) // calls `asyncFunction`, where param=2
 * (call 2 is pending)
 * ```
 *
 * @template Q
 * @template R
 * @param {AsyncFunction<Q, R>} asyncFunction the async function to wrap
 * @param {IUseAsyncOptions} [options]
 * @return {*}  {WrappedAsyncFunction<Q, R>}
 */
export const useAsync = <Q extends any[], R>(asyncFunction: AsyncFunction<Q, R>): WrappedAsyncFunction<Q, R> => {
  const ref = useRef<Promise<R>>();

  const isPending = useRef(false);

  const wrappedAsyncFunction: WrappedAsyncFunction<Q, R> = async (...args) => {
    if (ref.current && isPending.current) {
      return ref.current;
    }

    isPending.current = true;

    ref.current = asyncFunction(...args)
      .then(
        (response: R) => {
          isPending.current = false;

          return response;
        },
        (error) => {
          isPending.current = false;

          throw error;
        }
      )
      .catch((error) => {
        isPending.current = false;

        throw error;
      });

    return ref.current;
  };

  return wrappedAsyncFunction;
};
