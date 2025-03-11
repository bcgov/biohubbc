import { debounce, DebouncedFunc } from 'lodash-es';
import { useEffect, useMemo } from 'react';

/**
 * Returns a debounced version of the given callback.
 *
 * @template T The function arguments.
 * @param callback The callback to debounce.
 * @param delayMs The debounce delay in milliseconds.
 * @returns A debounced callback function.
 */
export const useDebounce = <T extends (...args: any[]) => void>(callback: T, delayMs: number): DebouncedFunc<T> => {
  const debouncedCallback = useMemo(() => debounce(callback, delayMs), [callback, delayMs]);

  useEffect(() => {
    // when the component unmounts, cancel the debounced callback
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback;
};
