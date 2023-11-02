import { useBiohubApi } from 'hooks/useBioHubApi';
import { ITaxonomy } from 'interfaces/useTaxonomy.interface';
import { PropsWithChildren, createContext, useCallback, useRef } from 'react';

export interface ITaxonomyContext {
  getSpeciesTaxonomyById: (id: number) => Promise<ITaxonomy>
}

export const TaxonomyContext = createContext<ITaxonomyContext>({
  getSpeciesTaxonomyById: () => Promise.reject()
});

export const TaxonomyContextProvider = (props: PropsWithChildren) => {
  const biohubApi = useBiohubApi();
  const _taxonomyCache = useRef<Record<number, Promise<ITaxonomy>>>({});

  const getSpeciesTaxonomyById: (id: number) => Promise<ITaxonomy> = useCallback(async (id: number) => {
    if (Object.hasOwn(_taxonomyCache.current, id)) {
      return _taxonomyCache.current[id]
    }

    _taxonomyCache.current[id] = biohubApi.taxonomy.getSpeciesFromIds([id]).then((result) => {
      return result.searchResponse[0]
    });

    return _taxonomyCache.current[id];
  }, []);

  const taxonomyContext: ITaxonomyContext = {
    getSpeciesTaxonomyById
  }

  return (
    <TaxonomyContext.Provider value={taxonomyContext}>
      {props.children}
    </TaxonomyContext.Provider>
  );
};
