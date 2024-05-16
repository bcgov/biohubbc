import { useState } from 'react';

/**
 * Save state between refreshes, windows and sessions.
 *
 * NOTE: This hook will attempt to grab from local storage BEFORE defaulting to intitial value.
 * If this hook is being rendered multiple times in children components, a unique key per child
 * must be provided.
 *
 * @template T - Generic.
 * @param {T} initialValue - Initial value for localStorage.
 * @param {string} localStorageId - Local storage identifier.
 * @returns {[T, (newValue: T) => void]} State and SetState handler.
 */
export const usePersistentState = <T,>(localStorageId: string, initialValue: T): [T, (newValue: T) => void] => {
  // local storage key - used to access the stored value
  const prefixedKey = `USE_PERSISTENT_STATE_${localStorageId}`;

  const [value, setValue] = useState<T>(() => {
    // attempt to retrieve value from local storage
    const storageValue = localStorage.getItem(prefixedKey);

    // if local storage does not contain value (undefined or null), default to initialValue
    if (storageValue === null) {
      return initialValue;
    }

    try {
      // attempt to parse storage value
      return JSON.parse(storageValue);
    } catch (err) {
      // unable to parse just return the value
      return storageValue;
    }
  });

  /**
   * Set the value in local storage and state.
   *
   * @param {T} newValue - Updated value.
   */
  const setPersistentValue = (newValue: T) => {
    const parsedValue = typeof newValue === 'string' ? newValue : JSON.stringify(newValue);
    // set local storage value
    localStorage.setItem(prefixedKey, parsedValue);
    // set state value
    setValue(newValue);
  };

  return [value, setPersistentValue];
};
