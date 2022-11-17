import { DependencyList, EffectCallback, useEffect } from 'react';
import { useDeepCompareMemo } from './useDeepCompareMemo';

export function useDeepCompareEffect(
  callback: EffectCallback,
  dependencies: DependencyList
): ReturnType<typeof useEffect> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useEffect(callback, useDeepCompareMemo(dependencies));
}
