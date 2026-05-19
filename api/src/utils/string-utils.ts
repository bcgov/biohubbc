import lodash from 'lodash';

const { isString } = lodash;

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

/**
 * Given a string:
 * - If the string is empty, null, or undefined, then null will be returned.
 * - Otherwise, the string will be converted to a number.
 *
 * @export
 * @param {(string | null | undefined)} value
 * @return {*}  {(number | null)}
 */
export function numberOrNull(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return Number(value);
}

/**
 * Convert a Set of strings to lowercase.
 *
 * @param {Set<string>} set The set of strings
 * @return {*}  {Set<string>} The set of strings in lowercase
 */
export function setToLowercase(set: Set<string>): Set<string> {
  return new Set([...set].map((value) => value.toLowerCase()));
}
