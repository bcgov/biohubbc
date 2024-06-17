import { Search } from 'history';
import qs from 'qs';
import { useHistory } from 'react-router';

/**
 * A hook that provides methods for reading and writing URL search params.
 *
 * @example
 * const { searchParams} = useSearchParams();
 * searchParams.set('key', 'value');
 * //setSearchParams(searchParams);
 *
 * @example
 * type MyType = { key1: 'value1' | 'value2' }
 * const { searchParams} = useSearchParams<MyType>();
 * const key1Value = searchParams.get('key1');
 * //setSearchParams(searchParams.set('key1', 'value2'));
 *
 * @export
 * @return {*}
 */
export function useSearchParams<ParamType extends Record<string, string> = Record<string, string>>() {
  const history = useHistory();

  const searchParams = new TypedURLSearchParams<ParamType>(history.location.search);

  const setSearchParams = (urlSearchParams: TypedURLSearchParams<ParamType>) => {
    history.push({
      ...location,
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
  constructor(search?: Search) {
    super(search);
  }

  set<K extends keyof ParamType & string>(key: K, value: ParamType[K]) {
    super.set(key, value);
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

    if (typeof value !== 'string') {
      // Note: the value will need to be parsed `qs.parse(value)` after being fetched via this classes `get(key)`
      super.set(key, qs.stringify(value));
      return this;
    }

    if (value.length === 0) {
      super.delete(key);
      return this;
    }

    super.set(key, value);
    return this;
  }

  get<K extends keyof ParamType & string>(key: K) {
    return super.get(key);
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
    return super.entries() as IterableIterator<[K, ParamType[K]]>;
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
    return super.keys() as IterableIterator<K>;
  }

  sort() {
    super.sort();
    return this;
  }

  values<K extends keyof ParamType & string>(): IterableIterator<ParamType[K]> {
    return super.values() as IterableIterator<ParamType[K]>;
  }
}
