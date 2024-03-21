import { AxiosInstance } from 'axios';
import { ICreateCritterMarking } from 'features/surveys/view/survey-animals/animal';
import { IMarkingResponse } from 'interfaces/useCritterApi.interface';

const useMarkingApi = (axios: AxiosInstance) => {
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

  return { createMarking, updateMarking, deleteMarking };
};

export { useMarkingApi };
