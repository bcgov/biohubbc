/**
 * A case-insensitive map - all string keys are normalized to lowercase.
 *
 * @example `
 *  const map = new CaseInsensitiveMap<string, number>();
 *  map.set('KEY', 1);
 *  map.get('key'); // 1
 *  map.has('kEy') // true
 *  `
 * @class CaseInsensitiveMap
 * @template KeyType - The key type
 * @template ValuesType - The value type
 * @extends {Map<KeyType, ValuesType>}
 */
export class CaseInsensitiveMap<KeyType, ValuesType> extends Map<KeyType, ValuesType> {
  /**
   * Set a key-value pair in the map.
   *
   * @param {KeyType} key - The key
   * @param {ValuesType} value - The value
   * @returns {this} The map
   */
  set(key: KeyType, value: ValuesType): this {
    if (typeof key === 'string') {
      key = key.toLowerCase() as KeyType;
    }

    return super.set(key, value);
  }

  /**
   * Get a value from the map.
   *
   * @param {KeyType} key - The key
   * @returns {ValuesType | undefined} The value
   */
  get(key: KeyType): ValuesType | undefined {
    if (typeof key === 'string') {
      key = key.toLowerCase() as KeyType;
    }
    return super.get(key);
  }

  /**
   * Check if the map has a key.
   *
   * @param {KeyType} key - The key
   * @returns {boolean} Whether the map has the key
   */
  has(key: KeyType): boolean {
    if (typeof key === 'string') {
      key = key.toLowerCase() as KeyType;
    }
    return super.has(key);
  }
}
