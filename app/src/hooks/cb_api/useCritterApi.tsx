import { AxiosInstance } from 'axios';
import { ICritterDetailedResponse, ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';

const useCritterApi = (axios: AxiosInstance) => {
  /**
   * Get a critter with detailed response.
   * Includes all markings, captures, mortalities etc.
   *
   * @async
   * @param {string} critter_id - Critter identifier.
   * @returns {Promise<ICritterDetailedResponse>}
   */
  const getDetailedCritter = async (critter_id: string): Promise<ICritterDetailedResponse> => {
    const { data } = await axios.get(`/api/critterbase/critters/${critter_id}?format=detailed`);
    return data;
  };

  /**
   * Get multiple critters by ids.
   *
   * @async
   * @param {string[]} critter_ids - Critter identifiers.
   * @returns {Promise<ICritterSimpleResponse>}
   */
  const getMultipleCrittersByIds = async (critter_ids: string[]): Promise<ICritterSimpleResponse[]> => {
    const { data } = await axios.post(`/api/critterbase/critters/`, { critter_ids });
    return data;
  };

  return { getDetailedCritter, getMultipleCrittersByIds };
};

export { useCritterApi };
