import { AxiosInstance } from 'axios';

const useCritterApi = (axios: AxiosInstance) => {
  /**
   * Get a critter with detailed response
   *
   * @async
   * @param {string} critter_id - critter identifier.
   * @returns {Promise<[TODO:type]>} [TODO:description]
   */
  const getDetailedCritter = async (critter_id: string) => {
    const { data } = await axios.get(`/api/critterbase/critters/${critter_id}?format=detailed`);
    return data;
  };

  const getMultipleCrittersByIds = async (critter_ids: string[]) => {
    const { data } = await axios.post(`/api/critterbase/critters/`, { critter_ids });
    return data;
  };

  return { getDetailedCritter, getMultipleCrittersByIds };
};

export { useCritterApi };
