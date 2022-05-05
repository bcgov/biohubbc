import { useEffect, useRef } from 'react';

/**
 * Runs a `callback` function on a timer, once every `period` milliseconds.
 *
 * Note: Does nothing if either `callback` or `period` are null/undefined/falsy.
 *
 * Note: If both `callback` and `period` are valid, the `callback` function will run for the first time after `period`
 * milliseconds (it will not run at time=0).
 *
 * @param {((() => any) | null | undefined)} callback the function to run at each interval. Set to a falsy value to stop
 * the interval.
 * @param {(number | null | undefined)} period interval period in milliseconds. How often the `callback` should run.
 * Set to a falsy value to stop the interval.
 * @param {(number)} [timeout] timeout in milliseconds. The total polling time before the interval times out and
 * automatically stops.
 */
export const useInterval = (
  callback: (() => any) | null | undefined,
  period: number | null | undefined,
  timeout?: number
): void => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!period || !savedCallback?.current) {
      return;
    }

    const interval = setInterval(() => savedCallback?.current?.(), period);

    let intervalTimeout: NodeJS.Timeout | undefined;

    if (timeout) {
      intervalTimeout = setTimeout(() => clearInterval(interval), timeout);
    }

    return () => {
      clearInterval(interval);

      if (intervalTimeout) {
        clearTimeout(intervalTimeout);
      }
    };
  }, [period, timeout]);
};
