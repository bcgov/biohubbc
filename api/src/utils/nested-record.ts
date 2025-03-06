import { get, setWith } from 'lodash';

type IKey = string | number;

/**
 * INestedRecord - A recursive nested record interface
 *
 */
interface INestedRecord<TValue> {
  [key: IKey]: TValue | INestedRecord<TValue>;
}

/**
 * NestedRecord - A class to handle nested records with case-insensitive keys
 *
 * @example
 *  const record = new NestedRecord({ a: { b: 'c' } });
 *  record.get('A', 'B'); // 'c'
 *  record.has('A', 'B'); // true
 *  record.set({ path: ['A', 'B'], value: 'd' });
 *
 * @class
 * @exports
 * @template TValue - The final value type
 */
export class NestedRecord<TValue = unknown> {
  record: INestedRecord<TValue>;

  constructor(record?: INestedRecord<TValue>) {
    this.record = record ? this._convertRecordToLowerCase(record) : {};
  }

  /**
   * Convert keys to lowercase
   *
   * @param {IKey[]} keys - The keys to convert
   * @returns {IKey[]} The keys in lowercase
   */
  _keysToLowercase(keys: IKey[]): IKey[] {
    return keys.map((key) => key.toString().toLowerCase());
  }

  /**
   * Convert a record to lowercase
   * Note: This function is recursive
   *
   * @param {INestedRecord<TValue>} record - The record to convert
   * @returns {INestedRecord<TValue>} The record with lowercase keys
   */
  _convertRecordToLowerCase(record: INestedRecord<TValue>): INestedRecord<TValue> {
    const newRecord: INestedRecord<TValue> = {};

    Object.keys(record).forEach((key) => {
      const newKey = key.toLowerCase();

      if (typeof record[key] === 'object') {
        newRecord[newKey] = this._convertRecordToLowerCase(record[key] as INestedRecord<TValue>);
      } else {
        newRecord[newKey] = record[key];
      }
    });

    return newRecord;
  }

  /**
   * Get a value from the nested record
   *
   * @param {...IKey[]} keys - The record keys in order
   * @returns {*} {TValue | INestedRecord<TValue> | undefined} The record or value or undefined
   */
  get(...keys: IKey[]): INestedRecord<TValue> | TValue | undefined {
    return get(this.record, this._keysToLowercase(keys));
  }

  /**
   * Check if the nested record has a value
   *
   * @param {...IKey[]} keys - The record keys in order
   * @returns True if the value or record exists
   */
  has(...keys: IKey[]): boolean {
    return this.get(...this._keysToLowercase(keys)) !== undefined;
  }

  /**
   * Set a value in the nested record
   *
   * Note: First param is the value to set, all other params are the keys
   *
   * @param {{path: IKey[], value: TValue}} { path, value } - The new nested record value and path (record keys)
   * @returns {*} {void}
   */
  set({ path, value }: { path: IKey[]; value: TValue }): void {
    setWith(this.record, this._keysToLowercase(path), value, Object);
  }
}
