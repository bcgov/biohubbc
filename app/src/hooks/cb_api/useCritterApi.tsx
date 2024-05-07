import { AxiosInstance } from 'axios';
import { IBulkCreateCritter, ICreateCritter } from 'features/surveys/view/survey-animals/animal';
import { ICritterDetailedResponse, ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';

const useCritterApi = (axios: AxiosInstance) => {
  /**
   * Create a critter.
   *
   * @async
   * @param {ICreateCritter} payload - Create critter payload.
   * @returns {Promise<ICritterSimpleResponse>} Simple critterbase critter.
   */
  const createCritter = async (payload: ICreateCritter): Promise<ICritterSimpleResponse> => {
    const { data } = await axios.post(`/api/critterbase/critters/create`, payload);
    return data;
  };

  /**
   * Update a critter.
   *
   * @async
   * @param {ICreateCritter} payload - Update critter payload.
   * @returns {Promise<ICritterSimpleResponse>} Simple critterbase critter.
   */
  const updateCritter = async (payload: ICreateCritter): Promise<ICritterSimpleResponse> => {
    const { data } = await axios.patch(`/api/critterbase/critters/${payload.critter_id}`, payload);
    return data;
  };

  /**
   * Create a critter with data
   *
   * @async
   * @param {ICreateCritter} payload - Create critter payload.
   * @returns {Promise<ICritterSimpleResponse>} Simple critterbase critter.
   */
  const bulkCreateCritter = async (payload: IBulkCreateCritter): Promise<ICritterSimpleResponse> => {
    const { data } = await axios.post('/api/critterbase/bulk', payload);
    return data;
  };

  // /**
  //  * Update a critter with data.
  //  *
  //  * @async
  //  * @param {ICreateCritter} payload - Update critter payload.
  //  * @returns {Promise<ICritterSimpleResponse>} Simple critterbase critter.
  //  */
  // const bulkUpdateCritter = async (payload: IBulkCreateCritter): Promise<ICritterSimpleResponse> => {
  //   const { data } = await axios.patch('/api/critterbase/bulk', payload);
  //   return data;
  // };

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
    const { data } = await axios.post(`/api/critterbase/critters`, { critter_ids });
    return data;
  };

  return {
    getDetailedCritter,
    getMultipleCrittersByIds,
    createCritter,
    updateCritter,
    bulkCreateCritter
  };
};

export { useCritterApi };
