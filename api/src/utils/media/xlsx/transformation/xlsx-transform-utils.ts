/**
 * Iterates over an object and returns an array of all unique combinations of values.
 *
 * @example
 * const obj = {
 *   'type1': [1, 2]
 *   'type2': [A, B]
 * }
 *
 * const result = getCombinations(obj);
 *
 * // result = [
 * //   [ 1,A ],
 * //   [ 1,B ],
 * //   [ 2,A ],
 * //   [ 2,B ]
 * // ]
 *
 * @example
 * const obj = {
 *   'type1': [1, 2]
 *   'type2': [A]
 * }
 *
 * const result = getCombinations(obj);
 *
 * // result = [
 * //   [ 1,A ],
 * //   [ 2,A ],
 * // ]
 *
 * @param {Record<string | number, any[]>>} obj
 * @returns An array of all combinations of the incoming `obj` values.
 */
export function getCombinations<O extends Record<string | number, any[]>>(obj: O) {
  let combos: { [k in keyof O]: O[k][number] }[] = [];
  for (const key in obj) {
    const values = obj[key];
    const all: typeof combos = [];
    for (const value of values) {
      for (let j = 0; j < (combos.length || 1); j++) {
        const newCombo = { ...combos[j], [key]: value };
        all.push(newCombo);
      }
    }
    combos = all;
  }
  return combos;
}

/**
 * Filters objects from an array based on the keys provided.
 *
 * @example
 * const arrayOfObjects = [
 *   {key: 1, name: 1, value: 1},
 *   {key: 1, name: 2, value: 2},
 *   {key: 1, name: 2, value: 3},
 *   {key: 2, name: 3, value: 4}
 * ]
 *
 * const result = filterDuplicateKeys(arrayOfObjects, ['key']);
 *
 * // result = [
 * //   {key: 1, name: 2, value: 3},
 * //   {key: 2, name: 3, value: 4}
 * // ]
 *
 * const result = filterDuplicateKeys(arrayOfObjects, ['key', 'name']);
 *
 * // result = [
 * //   {key: 1, name: 1, value: 1},
 * //   {key: 1, name: 2, value: 3},
 * //   {key: 2, name: 3, value: 4}
 * // ]
 *
 * @param {Record<string, any>[]} arrayOfObjects
 * @param {string[]} keys
 * @return {*}  {Record<string, any>[]}
 * @memberof XLSXTransform
 */
export function filterDuplicateKeys(arrayOfObjects: Record<string, any>[], keys: string[]): Record<string, any>[] {
  const keyValues: [string, any][] = arrayOfObjects.map((value) => {
    const key = keys.map((k) => value[k]).join('|');
    return [key, value];
  });

  const kvMap = new Map(keyValues);

  return [...kvMap.values()];
}
