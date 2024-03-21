import { AxiosInstance } from 'axios';
import { ICreateCritterMortality } from 'features/surveys/view/survey-animals/animal';
import { IMortalityResponse } from 'interfaces/useCritterApi.interface';

const useMortalityApi = (axios: AxiosInstance) => {
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

  return { createMortality, updateMortality, deleteMortality };
};

export { useMortalityApi };
