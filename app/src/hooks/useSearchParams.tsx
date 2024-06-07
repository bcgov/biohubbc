import { Search } from 'history';
import { useHistory } from 'react-router';

/**
 * A hook that provides methods for reading and writing URL search params.
 *
 * @example
 * const { urlParams, setURLParams } = useSearchParams();
 * urlParams.set('key', 'value');
 * setURLParams(urlParams);
 *
 * @example
 * type MyType = { key1: 'value1' | 'value2' }
 * const { urlParams, setURLParams } = useSearchParams<MyType>();
 * const key1Value = urlParams.get('key1');
 * setURLParams(urlParams.set('key1', 'value2'));
 *
 * @export
 * @return {*}
 */
export function useSearchParams<ParamType extends Record<string, string> = Record<string, string>>() {
  const history = useHistory();

  const urlParams = new TypedURLSearchParams<ParamType>(history.location.search);

  const setURLParams = (urlSearchParams: TypedURLSearchParams<ParamType>) => {
    history.push({
      ...location,
      search: urlSearchParams.toString()
    });
  };

  return { urlParams, setURLParams };
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
  constructor(search: Search) {
    super(search);
  }

  set<K extends keyof ParamType & string>(key: K, value: ParamType[K]) {
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
