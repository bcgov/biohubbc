import { useBiohubApi } from 'hooks/useBioHubApi';
import { ITaxonomy } from 'interfaces/useTaxonomy.interface';
import { PropsWithChildren, createContext, useCallback, useRef, useState, useMemo } from 'react';
import { has as hasProperty, get as getProperty } from 'lodash'

export interface ITaxonomyContext {
  /**
   * Denotes whether or not the context is currently loading taxonomic data
   */
  // isLoading: boolean;
  /**
   * Fetches taxonomy data for the given IDs. For each ID, if the results of its query
   * is already in the cache, it is immediately available. Otherwise, `null` is
   * returned, and the  the taxonomic data is fetched and subsequently cached.
   */
  getSpeciesTaxonomyById: (ids: number[]) => ITaxonomy | null;
  /**
   * Caches taxonomy data for the given IDs.
   */
  cacheSpeciesTaxonomyByIds: (ids: number[]) => Promise<void>;
}

export const TaxonomyContext = createContext<ITaxonomyContext>({
  // isLoading: false,
  getSpeciesTaxonomyById: () => null,
  cacheSpeciesTaxonomyByIds: () => Promise.resolve()
});

export const TaxonomyContextProvider = (props: PropsWithChildren) => {
  const biohubApi = useBiohubApi();
  const [_taxonomyCache, _setTaxonomyCache] = useState<Record<number, ITaxonomy | null>>({});
  const _dispatched = useRef<Record<number, Promise<void>>>({});

  const cacheSpeciesTaxonomyByIds = useCallback(async (ids: number[]) => {
    const promises = ids.map((id) => {
      _dispatched.current[id] = biohubApi.taxonomy.getSpeciesFromIds([id]).then((result) => {
        _setTaxonomyCache((previous) => ({
          ...previous,
          [id]: result?.searchResponse?.[0] ?? null
        }));
      });


    });

    await Promise.all(promises)
  }, [biohubApi.taxonomy.getSpeciesFromIds]);


  const getSpeciesTaxonomyById = useCallback((id: number): ITaxonomy | null => {
    
    if (hasProperty(_taxonomyCache, id)) {
      // Result is in the cache
      return getProperty(_taxonomyCache, id);
    }

    if (hasProperty(_dispatched.current, id)) {
      // Promise is pending
      return null;
    }

    // Dispatch the request to cache the result
    cacheSpeciesTaxonomyByIds([id]);

    return null;
  }, [_taxonomyCache]);


  const taxonomyContext: ITaxonomyContext = useMemo(() => ({
    // isLoading,
    getSpeciesTaxonomyById,
    cacheSpeciesTaxonomyByIds
  }), [getSpeciesTaxonomyById, cacheSpeciesTaxonomyByIds]);

  return (
    <TaxonomyContext.Provider value={taxonomyContext}>
      {props.children}
    </TaxonomyContext.Provider>
  );
};
