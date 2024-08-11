import { useConfigContext } from 'hooks/useContext';
import { IPartialTaxonomy, ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
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
    searchSpeciesByTerms
  };
};

/**
 * Parses the taxon search response into start case.
 *
 * The case of scientific names should not be modified. Genus names and higher are capitalized while
 * species-level and subspecies-level names (the second and third words in a species/subspecies name) are not capitalized.
 * Example: Ursus americanus, Rangifier tarandus caribou, Mammalia, Alces alces.
 *
 * The case of common names is less standardized and often just preference.
 *
 * @template T
 * @param {T[]} searchResponse - Array of Taxonomy objects
 * @returns {T[]} Correctly cased Taxonomy
 */
const parseSearchResponse = <T extends IPartialTaxonomy>(searchResponse: T[]): T[] => {
  return searchResponse.map((taxon) => ({
    ...taxon,
    commonNames: taxon.commonNames.map((commonName) => startCase(commonName)),
    scientificName: taxon.scientificName
  }));
};

export default useTaxonomyApi;
