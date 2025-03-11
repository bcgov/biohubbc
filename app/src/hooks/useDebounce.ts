import { useCallback, useRef } from 'react';

/**
 * Returns a debounced version of the given callback.
 *
 * TODO: Investigate the lodash `debounce` function
 *
 * @template T The function arguments.
 * @param callback The function to debounce.
 * @param delayMs The debounce delay in milliseconds.
 * @returns A debounced callback function.
 */
export const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delayMs: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      // clear the timeout if it exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // create or overwrite the existing timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delayMs);
    },
    [callback, delayMs]
  );
};
