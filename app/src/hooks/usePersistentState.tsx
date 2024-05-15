import { useCallback, useState } from 'react';

/**
 * Save state between refreshes, windows and sessions.
 *
 * NOTE: This hook will attempt to grab from local storage BEFORE defaulting to intitial value.
 * If this hook is being rendered multiple times in children components, a unique key per child
 * must be provided.
 *
 * @template T - Generic.
 * @param {T} initialValue - Initial value for localStorage.
 * @param {string} key - Local storage key.
 * @returns {[T, (newValue: T) => void]} State and SetState handler.
 */
export const usePersistentState = <T,>(key: string, initialValue: T): [T, (newValue: T) => void] => {
  // local storage key - used to access the stored value
  const prefixedKey = `USE_PERSISTENT_STATE_${key}`;

  /**
   * Retrieve the intial state.
   *
   * @returns {T} The initial value.
   */
  const getInitialState = useCallback((): T => {
    const storageValue = localStorage.getItem(prefixedKey);

    // if local storage does not contain value (undefined or null), default to initialValue
    if (storageValue == null) {
      return initialValue;
    }

    try {
      // parse value from local storage
      return JSON.parse(JSON.stringify(storageValue));
    } catch (err) {
      console.debug(`usePersistentState: error while parsing local storage value: ${storageValue}`);

      // clear bad localStorage value
      localStorage.removeItem(prefixedKey);

      // reset back to intialValue if error caught
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
    // only parse if newValue is not a string
    const parsedValue = typeof newValue === 'string' ? newValue : JSON.stringify(newValue);
    // set local storage value
    localStorage.setItem(prefixedKey, parsedValue);
    // set state value
    setStateValue(newValue);
  };

  return [value, setValue];
};
