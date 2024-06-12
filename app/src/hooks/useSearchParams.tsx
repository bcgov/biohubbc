import { Search } from 'history';
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
  constructor(search?: Search) {
    super(search);
  }

  set<K extends keyof ParamType & string>(key: K, value: ParamType[K]) {
    super.set(key, value);
    return this;
  }

  /**
   * Set a key-value pair if the value is not null or undefined, otherwise delete the key.
   *
   * @template K
   * @param {K} key
   * @param {(ParamType[K] | null)} [value]
   * @return {*}
   * @memberof TypedURLSearchParams
   */
  setOrDelete<K extends keyof ParamType & string>(key: K, value?: ParamType[K] | null) {
    if (value !== null && value !== undefined) {
      super.set(key, value);
    } else {
      super.delete(key);
    }
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
