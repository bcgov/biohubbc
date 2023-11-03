import { useBiohubApi } from 'hooks/useBioHubApi';
import { ITaxonomy } from 'interfaces/useTaxonomy.interface';
import { PropsWithChildren, createContext, useCallback, useRef } from 'react';

export interface ITaxonomyContext {
  getSpeciesTaxonomyById: (id: number) => ITaxonomy | null
}

export const TaxonomyContext = createContext<ITaxonomyContext>({
  getSpeciesTaxonomyById: () => null
});

export const TaxonomyContextProvider = (props: PropsWithChildren) => {
  const biohubApi = useBiohubApi();
  const _taxonomyCache = useRef<Record<number, ITaxonomy | null>>({});
  const _dispatchedIds = useRef<Set<number>>(new Set<number>());

  const getSpeciesTaxonomyById: (id: number) => ITaxonomy | null = useCallback((id: number) => {
    console.log('getSpeciesTaxonomyById()')
    if (_taxonomyCache.current[id]) {
      // Result is in the cache
      console.log('Found for', id, _taxonomyCache.current[id])
      return _taxonomyCache.current[id];
    }

    if (_dispatchedIds.current.has(id)) {
      // Promise is pending
      return null;
    }

    // Dispatch the request to cache the result
    _dispatchedIds.current.add(id);
    biohubApi.taxonomy.getSpeciesFromIds([id]).then((result) => {
      _taxonomyCache.current[id] = result.searchResponse[0];
    });

    return null;
  }, [_taxonomyCache, _dispatchedIds]);

  const taxonomyContext: ITaxonomyContext = {
    getSpeciesTaxonomyById
  }

  console.log({ _taxonomyCache })

  return (
    <TaxonomyContext.Provider value={taxonomyContext}>
      {props.children}
    </TaxonomyContext.Provider>
  );
};
