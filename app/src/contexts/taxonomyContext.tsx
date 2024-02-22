import { useBiohubApi } from 'hooks/useBioHubApi';
import useIsMounted from 'hooks/useIsMounted';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { get as getProperty, has as hasProperty } from 'lodash';
import { createContext, PropsWithChildren, useCallback, useRef, useState } from 'react';

export interface ITaxonomyContext {
  /**
   * Fetches taxonomy data for the given IDs. For each ID, if the results of its query
   * is already in the cache, it is immediately available. Otherwise, `null` is
   * returned, and the  the taxonomic data is fetched and subsequently cached.
   */
  getCachedSpeciesTaxonomyById: (id: number) => ITaxonomy | null;
  /**
   * Caches taxonomy data for the given IDs.
   */
  cacheSpeciesTaxonomyByIds: (ids: number[]) => Promise<void>;
}

export const TaxonomyContext = createContext<ITaxonomyContext | undefined>(undefined);

export const TaxonomyContextProvider = (props: PropsWithChildren) => {
  const biohubApi = useBiohubApi();

  const isMounted = useIsMounted();

  const [_taxonomyCache, _setTaxonomyCache] = useState<Record<number, ITaxonomy | null>>({});
  const _dispatchedIds = useRef<Set<number>>(new Set<number>([]));

  const cacheSpeciesTaxonomyByIds = useCallback(
    async (ids: number[]) => {
      if (!isMounted()) {
        return;
      }

      ids.forEach((id) => _dispatchedIds.current.add(id));
      await biohubApi.taxonomy
        .getSpeciesFromIds(ids)
        .then((result) => {
          const newTaxonomyItems: Record<string, ITaxonomy> = {};

          for (const item of result) {
            newTaxonomyItems[item.tsn] = item;
          }

          if (!isMounted()) {
            return;
          }

          _setTaxonomyCache((previous) => ({ ...previous, ...newTaxonomyItems }));
        })
        .catch(() => {})
        .finally(() => {
          if (!isMounted()) {
            return;
          }
        });
    },
    [biohubApi.taxonomy, isMounted]
  );

  const getCachedSpeciesTaxonomyById = useCallback(
    (id: number): ITaxonomy | null => {
      if (hasProperty(_taxonomyCache, id)) {
        // Taxonomy id was found in the cache, return cached data
        return getProperty(_taxonomyCache, id);
      }

      if (_dispatchedIds.current.has(id)) {
        // Request to fetch this taxon id is still pending
        return null;
      }

      // Dispatch a request to fetch the taxonomy and cache the result
      cacheSpeciesTaxonomyByIds([id]);

      return null;
    },
    [_taxonomyCache, cacheSpeciesTaxonomyByIds]
  );

  const taxonomyContext: ITaxonomyContext = {
    getCachedSpeciesTaxonomyById,
    cacheSpeciesTaxonomyByIds
  };

  return <TaxonomyContext.Provider value={taxonomyContext}>{props.children}</TaxonomyContext.Provider>;
};
