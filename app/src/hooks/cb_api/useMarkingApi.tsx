import { AxiosInstance } from 'axios';
import { ICreateCritterMarking } from 'features/surveys/view/survey-animals/animal';
import { IMarkingResponse } from 'interfaces/useCritterApi.interface';
import {
  IMarkingBodyLocationResponse,
  IMarkingColourOption,
  IMarkingTypeResponse
} from 'interfaces/useMarkingApi.interface';

const useMarkingApi = (axios: AxiosInstance) => {
  /**
   * Get possible marking types
   *
   * @async
   * @returns {Promise<IMarkingTypeResponse>} - The created marking.
   */
  const getMarkingTypeOptions = async (): Promise<IMarkingTypeResponse[]> => {
    const { data } = await axios.get(`api/critterbase/lookups/marking-types`);
    return data;
  };

  /**
   * Get possible marking body locations for a given species
   *
   * @async
   * @param {number} tsn
   * @returns {Promise<IMarkingTypeResponse>} - The created marking.
   */
  const getMarkingBodyLocationOptions = async (tsn: number): Promise<IMarkingBodyLocationResponse[]> => {
    const { data } = await axios.get(`api/critterbase/xref/taxon-marking-body-locations?tsn=${tsn}`);
    return data;
  };

  /**
   * Get possible marking colour options
   *
   * @async
   * @returns {Promise<IMarkingColourOption[]>} - The created marking.
   */
  const getMarkingColourOptions = async (): Promise<IMarkingColourOption[]> => {
    const { data } = await axios.get('api/critterbase/lookups/colours');
    return data;
  };

  /**
   * Create a Critter Marking.
   *
   * @async
   * @param {ICreateCritterMarking} payload
   * @returns {Promise<IMarkingResponse>} - The created marking.
   */
  const createMarking = async (payload: ICreateCritterMarking): Promise<IMarkingResponse> => {
    const { data } = await axios.post(`/api/critterbase/markings/create`, payload);
    return data;
  };

  /**
   * Update a Critter Marking.
   *
   * @async
   * @param {ICreateCritterMarking} payload
   * @returns {Promise<IMarkingResponse>} - The updated marking.
   */
  const updateMarking = async (payload: ICreateCritterMarking): Promise<IMarkingResponse> => {
    const { data } = await axios.patch(`/api/critterbase/markings/${payload.marking_id}`, payload);
    return data;
  };

  /**
   * Delete a Critter Marking.
   *
   * @async
   * @param {string} markingID
   * @returns {Promise<IMarkingResponse>} - The deleted marking.
   */
  const deleteMarking = async (markingID: string): Promise<IMarkingResponse> => {
    const { data } = await axios.delete(`/api/critterbase/markings/${markingID}`);

    return data;
  };

  return {
    createMarking,
    updateMarking,
    deleteMarking,
    getMarkingTypeOptions,
    getMarkingBodyLocationOptions,
    getMarkingColourOptions
  };
};

export { useMarkingApi };
