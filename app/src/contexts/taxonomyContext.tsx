import { useBiohubApi } from 'hooks/useBioHubApi';
import { ITaxonomy } from 'interfaces/useTaxonomy.interface';
import { PropsWithChildren, createContext, useCallback, useRef, useState, useEffect } from 'react';
import { has as hasProperty } from 'lodash'

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
  const [isLoading, _setIsLoading] = useState<boolean>(false);
  const biohubApi = useBiohubApi();
  const _taxonomyCache = useRef<Record<number, ITaxonomy | null>>({});
  const _promises = useRef<Record<number, Promise<void>>>({});

  const getSpeciesTaxonomyById: (id: number) => ITaxonomy | null = useCallback((id: number) => {
    if (_taxonomyCache.current[id]) {
      // Result is in the cache
      return _taxonomyCache.current[id];
    }

    if (hasProperty(_promises.current, id)) {
      // Promise is pending
      return null;
    }

    // Dispatch the request to cache the result
    _setIsLoading(true);
    _promises.current[id] = biohubApi.taxonomy.getSpeciesFromIds([id]).then((result) => {
      _taxonomyCache.current[id] = result.searchResponse[0];
    });

    return null;
  }, [_taxonomyCache, _promises, isLoading]);

  // Used to maintain loading state
  useEffect(() => {
    console.log('promises:', _promises.current)
    if (!isLoading) {
      return;
    }
  
    Promise.all(Object.values(_promises.current)).then(() => {
      _setIsLoading(false);
    });
  }, [isLoading]);

  const taxonomyContext: ITaxonomyContext = {
    isLoading,
    getSpeciesTaxonomyById
  }

  return (
    <TaxonomyContext.Provider value={taxonomyContext}>
      {props.children}
    </TaxonomyContext.Provider>
  );
};
