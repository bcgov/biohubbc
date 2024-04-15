import { isString } from 'lodash';

/**
 * Safely apply `.toLowerCase()` to a value of unknown type.
 *
 * If the value is not a string, then the original unaltered value will be returned.
 *
 * @export
 * @template T
 * @param {T} value
 * @return {*}  {T}
 */
export function safeToLowerCase<T>(value: T): T {
  if (isString(value)) {
    return value.toLowerCase() as unknown as T;
  }

  return value;
}

/**
 * Safely apply `.trim()` to a value of unknown type.
 *
 * If the value is not a string, then the original unaltered value will be returned.
 *
 * @export
 * @template T
 * @param {T} value
 * @return {*}  {T}
 */
export function safeTrim<T>(value: T): T {
  if (isString(value)) {
    return value.trim() as unknown as T;
  }

  return value;
}
