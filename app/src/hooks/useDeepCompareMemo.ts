import isEqual from 'lodash-es/isEqual';
import { useMemo, useRef } from 'react';

/**
 * The same `useMemo` except with deep equality checks.
 *
 * Usage: use when the dependencies are objects or arrays. If dependencies are primitives, then use default `useMemo`.
 *
 * @export
 * @template T
 * @param {T} value the value to be memoized (usually a dependency list)
 * @return {*} a memoized version of the value as long as it remains deeply equal
 */
export function useDeepCompareMemo<T>(value: T) {
  const ref = useRef<T>(value);
  const signalRef = useRef<number>(0);

  if (!isEqual(value, ref.current)) {
    ref.current = value;
    signalRef.current += 1;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ref.current, [signalRef.current]);
}
