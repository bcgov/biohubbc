import { useRef, useEffect } from 'react';

/**
 * Runs a `callback` function on a timer, once every `delay` milliseconds.
 *
 * Note: Does nothing if either `callback` or `delay` are null/undefined/falsy.
 *
 * Note: If both `callback` and `delay` are valid, the `callback` function will run for the first time after `delay`
 * milliseconds (it will not run at time=0).
 *
 * @param {(Function | null | undefined)} callback the function to run at each interval. Set to a falsy value to stop
 * the interval.
 * @param {(number | null | undefined)} delay timer delay in milliseconds. Set to a falsy value to stop the interval.
 */
export const useInterval = (callback: Function | null | undefined, delay: number | null | undefined): void => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!delay || !savedCallback?.current) {
      return;
    }

    const timeout = setInterval(() => savedCallback?.current?.(), delay);

    return () => clearInterval(timeout);
  }, [delay]);
};
