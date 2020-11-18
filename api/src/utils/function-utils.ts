import cache from 'memory-cache';

/**
 * Wraps a function in a debounce function, which prevents it from being called until a delay period has elapsed.
 * Repeated calls within the delay period will reset the delay.
 *
 * @param {number} delay delay in milliseconds between calls that must elapse before the function will be executed
 * @param {(...args: any) => any} fn function to debounce
 * @returns {(...args: any) => any}
 */
export const debounced = function (delay: number, fn: (...args: any) => any): (...args: any) => any {
  let timerId: NodeJS.Timeout;

  return (...args) => {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };
};

/**
 * Wraps a function in a throttle function, which prevents it from being called again until a delay period has
 * elapsed. Repeated calls within the delay period will be ignored.
 *
 * @param {number} delay delay in milliseconds between calls that must elapse before the function will be executed again
 * @param {(...args: any) => any} fn function to throttle
 * @returns {(...args: any) => any}
 */
export const throttled = function (delay: number, fn: (...args: any) => any): (...args: any) => any {
  let lastCall = 0;

  return (...args) => {
    const now = new Date().getTime();

    if (now - lastCall < delay) {
      return;
    }

    lastCall = now;

    return fn(...args);
  };
};

/**
 * Wraps a function in a cache function. If the cache is unset or has expired, the original function will be called and
 * the response will be stored in the cache for use in subsequent calls. Repeated calls within the expiration period
 * will return the last cached value.
 *
 * @param {string} key key to store the cached value against
 * @param {number} expiration time to maintain the cache, in milliseconds
 * @param {((...args: any) => any | Promise<any>)} fn function to cache
 * @returns {(...args: any) => Promise<any>} original function wrapped in an async function that provides caching
 */
export const cached = function (
  key: string,
  expiration: number,
  fn: (...args: any) => any | Promise<any>
): (...args: any) => Promise<any> {
  return async (...args) => {
    // Get a cached copy, if available
    const cachedResult = cache.get(key);

    // Set the result using the non-null cached copy, or else fetch a new copy
    const result = cachedResult || (await fn(...args));

    // If the cached copy was null, then set the cache
    if (!cachedResult) {
      cache.put(key, result, expiration);
    }

    return result;
  };
};
