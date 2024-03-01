import { AxiosInstance } from 'axios';

const useCritterApi = (axios: AxiosInstance) => {
  /**
   * Get a critter with detailed response.
   * Includes all markings, captures, mortalities etc.
   *
   * @async
   * @param {string} critter_id - Critter identifier.
   * @returns {Promise<[TODO:type]>}
   */
  const getDetailedCritter = async (critter_id: string) => {
    const { data } = await axios.get(`/api/critterbase/critters/${critter_id}?format=detailed`);
    return data;
  };

  /**
   * Get multiple critters by ids.
   *
   * @async
   * @param {string[]} critter_ids - Critter identifiers.
   * @returns {Promise<[TODO:type]>}
   */
  const getMultipleCrittersByIds = async (critter_ids: string[]) => {
    const { data } = await axios.post(`/api/critterbase/critters/`, { critter_ids });
    return data;
  };

  return { getDetailedCritter, getMultipleCrittersByIds };
};

export { useCritterApi };
