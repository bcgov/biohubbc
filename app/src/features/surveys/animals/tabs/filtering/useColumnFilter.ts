import { useState } from 'react';

export function useColumnFilter<T = string>(initialValue: T = '' as T) {
  const [filter, setFilter] = useState<T>(initialValue);
  return [filter, setFilter] as const;
}
