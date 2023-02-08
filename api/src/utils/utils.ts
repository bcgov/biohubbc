/**
 * Safely apply `toLowerCase()` to a value of unknown type.
 *
 * If the type does not have a `toString()` method, then the original unaltered value will be returned.
 *
 * @export
 * @param {*} value
 * @return {*}
 */
export function safeToLowerCase<T>(value: T): T {
  if (isString(value)) {
    return value.toLowerCase() as T;
  }

  return value;
}

export function safeTrim<T>(value: T): T {
  if (isString(value)) {
    return value.trim() as T;
  }

  return value;
}

export function isString(value: unknown): value is string {
  return String(value) === value;
}
