import qs from 'qs';
import { useHistory } from 'react-router';

/**
 * A hook that provides methods for reading and writing URL search params.
 *
 * @example
 * const { searchParams, setSearchParams } = useSearchParams();
 * searchParams.set('key', 'value');
 * setSearchParams(searchParams);
 *
 * @example
 * type MyType = { key1: 'value1' | 'value2' }
 * const { searchParams, setSearchParams } = useSearchParams<MyType>();
 * const key1Value = searchParams.get('key1');
 * setSearchParams(searchParams.set('key1', 'value2'));
 *
 * @export
 * @return {*}
 */
export function useSearchParams<ParamType extends Record<string, string> = Record<string, string>>() {
  const history = useHistory();

  const searchParams = new TypedURLSearchParams<ParamType>(history.location.search);

  const setSearchParams = (urlSearchParams: TypedURLSearchParams<ParamType>) => {
    history.push({
      ...history.location,
      search: urlSearchParams.toString()
    });
  };

  return {
    searchParams,
    setSearchParams
  };
}

/**
 * An extension of URLSearchParams that wraps the original methods to provide type safety.
 *
 * @export
 * @class TypedURLSearchParams
 * @extends {URLSearchParams}
 * @template ParamType
 */
export class TypedURLSearchParams<
  ParamType extends Record<string, string> = Record<string, string>
> extends URLSearchParams {
  /**
   * Sets a search parameter with the given key and value.
   * If replace option is true, all existing parameters are cleared first. Replace option can also be an array of params,
   * which will clear only those params.
   *
   * @param key The parameter key
   * @param value The parameter value
   * @param options Configuration options
   * @returns The instance for method chaining
   */
  set<K extends keyof ParamType & string>(key: K, value: ParamType[K], options?: { replace?: boolean }) {
    const { replace } = options || {};

    if (replace) {
      // Clear all existing parameters first
      Array.from(super.keys()).forEach((k) => {
        super.delete(k);
      });
    }

    super.set(key, value);
    return this;
  }

  /**
   * Sets multiple search parameters at once.
   *
   * @param entries An object of key-value pairs to set.
   * @param options Configuration options
   * @returns The instance for method chaining
   */
  setMany(values: Partial<ParamType>, options?: { replace?: boolean }) {
    const { replace } = options || {};

    if (replace) {
      // Clear all existing parameters first
      Array.from(super.keys()).forEach((k) => {
        super.delete(k);
      });
    }

    Object.entries(values).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        super.delete(key);
      } else {
        super.set(key, String(value));
      }
    });

    return this;
  }

  /**
   * Given a key and a value of unknown type:
   * - If the value is null or undefined, the key is deleted.
   * - If the value is not a string, it is stringified using qs.stringify and set.
   * - If the value is an empty string, the key is deleted.
   * - Otherwise, if the value is a non-empty string, it is set.
   *
   * @template K
   * @param {K} key
   * @param {unknown} [value]
   * @return {*}
   * @memberof TypedURLSearchParams
   */
  setOrDelete<K extends keyof ParamType & string>(key: K, value?: unknown) {
    if (value === null || value === undefined) {
      super.delete(key);
      return this;
    }

    if (typeof value === 'string') {
      if (value.length === 0) {
        super.delete(key);
        return this;
      }

      super.set(key, value);
      return this;
    }

    if (typeof value === 'number') {
      super.set(key, String(value));
      return this;
    }

    if (Array.isArray(value)) {
      // Note: the value will need to be fetched via this classes getArray(key) method
      super.set(key, qs.stringify(value, { allowEmptyArrays: false, arrayFormat: 'repeat' }));
      return this;
    }

    // Note: the value will need to be parsed qs.parse(value) after being fetched via this classes get(key)
    super.set(key, qs.stringify(value));
    return this;
  }

  get<K extends keyof ParamType & string>(key: K) {
    return super.get(key);
  }

  /**
   * Returns the first value associated to the given search parameter, and parses it into an array of strings.
   *
   * @template K
   * @param {K} key
   * @return {*}  {string[]}
   * @memberof TypedURLSearchParams
   */
  getArray<K extends keyof ParamType & string>(key: K): string[] {
    const value = super.get(key);

    if (!value) {
      return [];
    }

    return Object.values(qs.parse(value, { parseArrays: true, strictNullHandling: true }) as Record<string, string>);
  }

  delete<K extends keyof ParamType & string>(key: K) {
    super.delete(key);
    return this;
  }

  toString() {
    return super.toString();
  }

  append<K extends keyof ParamType & string>(key: K, value: ParamType[K]) {
    super.append(key, value);
    return this;
  }

  entries<K extends keyof ParamType & string>() {
    return super.entries() as URLSearchParamsIterator<[string, ParamType[K]]>;
  }

  forEach<K extends keyof ParamType & string>(
    callback: (value: ParamType[K], key: K, searchParams: URLSearchParams) => void
  ) {
    super.forEach(callback as (value: string, key: string, searchParams: URLSearchParams) => void);
    return this;
  }

  getAll<K extends keyof ParamType & string>(key: K) {
    return super.getAll(key) as K[];
  }

  has<K extends keyof ParamType & string>(key: K) {
    return super.has(key);
  }

  keys<K extends keyof ParamType & string>() {
    return super.keys() as URLSearchParamsIterator<K>;
  }

  sort() {
    super.sort();
    return this;
  }

  values<K extends keyof ParamType & string>(): URLSearchParamsIterator<ParamType[K]> {
    return super.values() as URLSearchParamsIterator<ParamType[K]>;
  }
}
