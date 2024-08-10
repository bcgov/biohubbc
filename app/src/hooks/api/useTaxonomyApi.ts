import { useConfigContext } from 'hooks/useContext';
import { IPartialTaxonomy, ITaxonomy, ITaxonomyHierarchy } from 'interfaces/useTaxonomyApi.interface';
import { startCase } from 'lodash-es';
import qs from 'qs';
import useAxios from './useAxios';

const useTaxonomyApi = () => {
  const config = useConfigContext();
  const apiAxios = useAxios(config.BACKBONE_PUBLIC_API_HOST);

  /**
   * Searches for taxon records based on ITIS TSNs.
   *
   * TODO: Update the return type to `ITaxonomy[]` once the BioHub API endpoint is updated to return the extra `rank`
   * and `kingdom` fields.
   *
   * @param {number[]} tsns
   * @return {*}  {Promise<IPartialTaxonomy[]>}
   */
  const getSpeciesFromIds = async (tsns: number[]): Promise<IPartialTaxonomy[]> => {
    const { data } = await apiAxios.get<{
      searchResponse: IPartialTaxonomy[];
    }>(config.BIOHUB_TAXON_TSN_PATH, {
      params: {
        tsn: [...new Set(tsns)]
      },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return parseSearchResponse(data.searchResponse);
  };

  /**
   * Retrieves parent taxons for multiple TSNs
   *
   * @param {number[]} tsns
   * @return {*}  {Promise<IPartialTaxonomy[]>}
   */
  const getTaxonHierarchyByTSNs = async (tsns: number[]): Promise<ITaxonomyHierarchy[]> => {
    const { data } = await apiAxios.get<ITaxonomyHierarchy[]>('/api/taxonomy/taxon/tsn/hierarchy', {
      params: {
        tsn: [...new Set(tsns)]
      },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  /**
   * Search for taxon records by search terms.
   *
   * @param {string[]} searchTerms
   * @return {*}  {(Promise<ITaxonomy[]>)}
   */
  const searchSpeciesByTerms = async (searchTerms: string[]): Promise<ITaxonomy[]> => {
    try {
      const { data } = await apiAxios.get<{ searchResponse: ITaxonomy[] }>(config.BIOHUB_TAXON_PATH, {
        params: { terms: searchTerms },
        paramsSerializer: (params) => {
          return qs.stringify(params);
        }
      });

      if (!data.searchResponse) {
        return [];
      }

      return parseSearchResponse(data.searchResponse);
    } catch (error) {
      throw new Error('Failed to fetch Taxon records.');
    }
  };

  return {
    getSpeciesFromIds,
    searchSpeciesByTerms,
    getTaxonHierarchyByTSNs
  };
};

/**
 * Parses the taxon search response into start case.
 *
 * @template T
 * @param {T[]} searchResponse - Array of Taxonomy objects
 * @returns {T[]} Correctly cased Taxonomy
 */
const parseSearchResponse = <T extends IPartialTaxonomy>(searchResponse: T[]): T[] => {
  return searchResponse.map((taxon) => ({
    ...taxon,
    commonNames: taxon.commonNames.map((commonName) => startCase(commonName)),
    scientificName: startCase(taxon.scientificName)
  }));
};

export default useTaxonomyApi;
