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
 * @return {*} {{ enable: () => void, disable: () => void}} `enable` and `disable` callbacks which start or stop polling.
 */
export const useInterval = (
  callback: (() => any) | null | undefined,
  period: number | null | undefined,
  timeout?: number
): { enable: () => void, disable: () => void } => {
  const savedCallback = useRef(callback);
  const interval = useRef<NodeJS.Timeout | undefined>(undefined);
  const intervalTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const enable = () => {
    if (!period || !savedCallback?.current) {
      return;
    }
    
    disable();

    interval.current = setInterval(() => savedCallback?.current?.(), period);

    if (timeout && interval.current) {
      intervalTimeout.current = setTimeout(() => clearInterval(Number(interval.current)), timeout);
    }
  }

  const disable = () => {
    if (interval) {
      clearInterval(Number(interval.current));
    }

    if (intervalTimeout) {
      clearTimeout(Number(intervalTimeout.current));
    }
  }

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    enable();

    return () => {
      disable();
    };
  }, [period, timeout]);

  return { enable, disable }
};
