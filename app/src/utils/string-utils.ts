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
