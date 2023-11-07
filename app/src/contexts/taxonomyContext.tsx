import { useBiohubApi } from 'hooks/useBioHubApi';
import { ITaxonomy } from 'interfaces/useTaxonomy.interface';
import { PropsWithChildren, createContext, useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { has as hasProperty, get as getProperty } from 'lodash'

export interface ITaxonomyContext {
  /**
   * Denotes whether or not the context is currently loading taxonomic data
   */
  isLoading: boolean;
  /**
   * Fetches taxonomy data for the given ID. If the results of this query are already in
   * the cache, they are immediately returned. Otherwise, `null` is returned, and the 
   * the taxonomic data is fetched and subsequently cached.
   */
  getSpeciesTaxonomyById: (id: number) => ITaxonomy | null;
}

export const TaxonomyContext = createContext<ITaxonomyContext>({
  isLoading: false,
  getSpeciesTaxonomyById: () => null
});

export const TaxonomyContextProvider = (props: PropsWithChildren) => {
  // const [isLoading, _setIsLoading] = useState<boolean>(false);
  const biohubApi = useBiohubApi();
  const [_taxonomyCache, _setTaxonomyCache] = useState<Record<number, ITaxonomy | null>>({});
  const _dispatchedIds = useRef<Set<number>>(new Set<number>([]));

  const getSpeciesTaxonomyById: (id: number) => ITaxonomy | null = useCallback((id: number) => {
    
    if (hasProperty(_taxonomyCache, id)) {
      // Result is in the cache
      return getProperty(_taxonomyCache, id);
    }

    if (_dispatchedIds.current.has(id)) {
      // Promise is pending
      return null;
    }

    // Dispatch the request to cache the result
    // _setIsLoading(true);
    _dispatchedIds.current.add(id);
    biohubApi.taxonomy.getSpeciesFromIds([id]).then((result) => {
      _setTaxonomyCache((previous) => ({
        ...previous,
        [id]: result?.searchResponse?.[0] ?? null
      }));
    });

    return null;
  }, [_taxonomyCache]);

  // Used to maintain loading state
  /*
  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const hasFinishedLoading = Array
      .from(_dispatchedIds.current)
      .every((id) => hasProperty(_taxonomyCache, id));

      if (hasFinishedLoading) {
    console.log('hasFinishedLoading;', {  _taxonomyCache,
      _dispatchedIds: _dispatchedIds.current
    
    
    })
  }

    if (hasFinishedLoading) {
      _setIsLoading(false);
    }

  }, [isLoading, _taxonomyCache, _dispatchedIds.current]);
  */
  /*
  const isLoading = useMemo(() => {

    const xs = Array.from(_dispatchedIds.current).map((id) => {
      return !hasProperty(_taxonomyCache, id)
    });

    return xs.some(Boolean);
  }, [_taxonomyCache, _dispatchedIds.current])
  */

  const isLoading = _dispatchedIds.current.size > Object.keys(_taxonomyCache).length;

  console.log('_dispatchedIds.current.size', _dispatchedIds.current.size)
  console.log('Object.keys(_taxonomyCache).length', Object.keys(_taxonomyCache).length)

  console.log({
    isLoading,
    // xs,
    _taxonomyCache,
    _dispatchedIds: _dispatchedIds.current
  });

  const taxonomyContext: ITaxonomyContext = useMemo(() => ({
    isLoading,
    getSpeciesTaxonomyById
  }), [isLoading, getSpeciesTaxonomyById]);

  return (
    <TaxonomyContext.Provider value={taxonomyContext}>
      {props.children}
    </TaxonomyContext.Provider>
  );
};
