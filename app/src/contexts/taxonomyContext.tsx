import { useBiohubApi } from 'hooks/useBioHubApi';
import useIsMounted from 'hooks/useIsMounted';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { get as getProperty, has as hasProperty } from 'lodash';
import { createContext, PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';

export interface ITaxonomyContext {
  /**
   * Fetches taxonomy data for the given ITIS TSN. For each TSN, if the results of its query
   * is already in the cache, it is immediately available. Otherwise, `null` is
   * returned, and the  the taxonomic data is fetched and subsequently cached.
   */
  getCachedSpeciesTaxonomyById: (tsn: number) => IPartialTaxonomy | null;
  /**
   * Fetches taxonomy data for the given ITIS TSN. For each TSN, if the results of its query
   * is already in the cache, it is immediately resolved. Otherwise, a request is dispatched
   * and the pending promise is returned.
   */
  getCachedSpeciesTaxonomyByIdAsync: (tsn: number) => Promise<IPartialTaxonomy | null>;
  /**
   * Caches taxonomy data for the given ITIS TSNs.
   */
  cacheSpeciesTaxonomyByIds: (tsns: number[]) => Promise<IPartialTaxonomy[] | null>;
}

export const TaxonomyContext = createContext<ITaxonomyContext | undefined>(undefined);

export const TaxonomyContextProvider = (props: PropsWithChildren) => {
  const biohubApi = useBiohubApi();

  const isMounted = useIsMounted();

  const [taxonomyCache, setTaxonomyCache] = useState<Record<number, IPartialTaxonomy | null>>({});
  const _dispatchedTsnPromises = useRef<Record<number, Promise<IPartialTaxonomy | null>>>({});

  const cacheSpeciesTaxonomyByIds = useCallback(
    async (tsns: number[]) => {
      const fetchTaxonomiesPromise = biohubApi.taxonomy
        .getSpeciesFromIds(tsns)
        .then((taxonomies) => {
          if (!isMounted()) {
            return null;
          }

          // Update the sync cache for the current tsn
          const newTaxonomyItems: Record<number, IPartialTaxonomy> = {};
          for (const taxon of taxonomies) {
            newTaxonomyItems[taxon.tsn] = taxon;
          }
          setTaxonomyCache((previous) => ({ ...previous, ...newTaxonomyItems }));

          return taxonomies;
        })
        .catch(() => {
          return null;
        });

      for (const tsn of tsns) {
        // Track the promise against each tsn, resolving the matching value for each tsn
        _dispatchedTsnPromises.current[tsn] = fetchTaxonomiesPromise
          .then((taxonomies) => {
            if (!isMounted()) {
              return null;
            }

            if (!taxonomies) {
              return null;
            }

            // Return the taxon data for the current tsn
            return taxonomies.find((taxonomy) => taxonomy.tsn === tsn) ?? null;
          })
          .catch(() => {
            return null;
          });
      }

      return fetchTaxonomiesPromise;
    },
    [biohubApi.taxonomy, isMounted]
  );

  const getCachedSpeciesTaxonomyById = useCallback(
    (tsn: number): IPartialTaxonomy | null => {
      if (hasProperty(taxonomyCache, tsn)) {
        // Taxonomy tsn was found in the cache, return cached data
        return getProperty(taxonomyCache, tsn);
      }

      if (_dispatchedTsnPromises.current[tsn] !== undefined) {
        // Request to fetch this taxon tsn is still pending
        return null;
      }

      // Dispatch a request to fetch the taxonomy and cache the result
      cacheSpeciesTaxonomyByIds([tsn]);

      return null;
    },
    [taxonomyCache, cacheSpeciesTaxonomyByIds]
  );

  const getCachedSpeciesTaxonomyByIdAsync = useCallback(
    async (tsn: number): Promise<IPartialTaxonomy | null> => {
      if (_dispatchedTsnPromises.current[tsn] !== undefined) {
        // Return pending promise for this taxon tsn
        return _dispatchedTsnPromises.current[tsn];
      }

      // Dispatch a request to fetch the taxonomy and cache the result
      await cacheSpeciesTaxonomyByIds([tsn]);

      return _dispatchedTsnPromises.current[tsn];
    },
    [cacheSpeciesTaxonomyByIds]
  );

  const taxonomyContext: ITaxonomyContext = useMemo(
    () => ({
      getCachedSpeciesTaxonomyById,
      getCachedSpeciesTaxonomyByIdAsync,
      cacheSpeciesTaxonomyByIds
    }),
    [cacheSpeciesTaxonomyByIds, getCachedSpeciesTaxonomyById, getCachedSpeciesTaxonomyByIdAsync]
  );

  return <TaxonomyContext.Provider value={taxonomyContext}>{props.children}</TaxonomyContext.Provider>;
};
