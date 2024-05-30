import { AxiosInstance } from 'axios';
import { ICreateCritterMortality } from 'features/surveys/view/survey-animals/animal';
import { ICauseOfDeathOption, IMortalityResponse } from 'interfaces/useCritterApi.interface';

const useMortalityApi = (axios: AxiosInstance) => {
  /**
   * Get a critter's Mortality.
   *
   * @async
   * @param {string} mortalityId
   * @returns {Promise<IMortalityResponse>} - The requested mortality.
   */
  const getMortality = async (mortalityId: string): Promise<IMortalityResponse> => {
    const { data } = await axios.get(`/api/critterbase/mortality/${mortalityId}`);

    return data;
  };

  /**
   * Create critter mortality.
   *
   * @async
   * @param {ICreateCritterMortality} payload - Create critter mortality payload.
   * @returns {Promise<IMortalityResponse>} The created critter mortality.
   */
  const createMortality = async (payload: ICreateCritterMortality): Promise<IMortalityResponse> => {
    const { data } = await axios.post(`/api/critterbase/mortality/create`, payload);
    return data;
  };

  /**
   * Update critter mortality.
   *
   * @async
   * @param {ICreateCritterMortality} payload - Update critter mortality payload.
   * @returns {Promise<IMortalityResponse>} The updated critter mortality.
   */
  const updateMortality = async (payload: ICreateCritterMortality): Promise<IMortalityResponse> => {
    const { data } = await axios.patch(`/api/critterbase/mortality/${payload.mortality_id}`, payload);
    return data;
  };

  /**
   * Delete critter mortality.
   *
   * @async
   * @param {string} mortalityID - mortality_id.
   * @returns {Promise<IMortalityResponse>} The deleted critter mortality.
   */
  const deleteMortality = async (mortalityID: string): Promise<IMortalityResponse> => {
    const { data } = await axios.delete(`/api/critterbase/mortality/${mortalityID}`);

    return data;
  };

  /**
   * Get cause of death options for creating a mortality
   *
   * @async
   * @returns {*} Cause of death options
   */
  const getCauseOfDeathOptions = async (): Promise<ICauseOfDeathOption[]> => {
    const { data } = await axios.get(`/api/critterbase/lookups/cods?format=asSelect`);
    return data;
  };

  return { getMortality, createMortality, updateMortality, deleteMortality, getCauseOfDeathOptions };
};

export { useMortalityApi };
