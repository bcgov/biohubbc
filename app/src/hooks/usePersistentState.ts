import { useCallback, useState } from 'react';

/**
 * Save state between refreshes, windows and sessions.
 * NOTE: This hook will attempt to grab from local storage before defaulting to intitial value.
 *
 * @template T - Generic.
 * @param {T} initialValue - Initial value for localStorage.
 * @param {string} key - Local storage key.
 * @returns {[T, (newValue: T) => void]} State and SetState handler.
 */
export const usePersistentState = <T>(key: string, initialValue: T): [T, (newValue: T) => void] => {
  const prefixedKey = `USE_PERSISTENT_STATE_${key}`;

  /**
   * Retrieve the intial state.
   *
   * @returns {T} The initial value.
   */
  const getInitialState = useCallback((): T => {
    const storageValue = localStorage.getItem(prefixedKey);

    // if local storage does not contain value, default to initialValue
    if (!storageValue) {
      return initialValue;
    }

    try {
      // parse object from stringified local storage value
      return JSON.parse(storageValue);
    } catch (err) {
      console.debug(`usePersistentState: error while parsing local storage value: ${storageValue}`);
      localStorage.removeItem(prefixedKey);
      return initialValue;
    }
  }, [initialValue, prefixedKey]);

  const [value, setStateValue] = useState<T>(getInitialState());

  /**
   * Set the value in local storage and state.
   *
   * @param {T} newValue - Updated value.
   */
  const setValue = (newValue: T) => {
    // set local storage value
    localStorage.setItem(prefixedKey, JSON.stringify(newValue));
    // set state value
    setStateValue(newValue);
  };

  return [value, setValue];
};
