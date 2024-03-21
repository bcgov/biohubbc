import { AxiosInstance } from 'axios';
import { ICreateCritterCapture } from 'features/surveys/view/survey-animals/animal';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';
import { isEqual } from 'lodash-es';

const useCaptureApi = (axios: AxiosInstance) => {
  /**
   * Create a critter Capture.
   *
   * @async
   * @param {ICreateCritterCapture} payload
   * @returns {Promise<ICaptureResponse>} - The created capture.
   */
  const createCapture = async (payload: ICreateCritterCapture): Promise<ICaptureResponse> => {
    const { data } = await axios.post(`/api/critterbase/captures/create`, payload);
    return data;
  };

  /**
   * Update a critter Capture.
   *
   * @async
   * @param {ICreateCritterCapture} payload
   * @returns {Promise<ICaptureResponse>} - The updated capture.
   */
  const updateCapture = async (payload: ICreateCritterCapture): Promise<ICaptureResponse> => {
    const force_create_release =
      payload.capture_location.location_id === payload.release_location.location_id &&
      !isEqual(payload.capture_location, payload.release_location);

    const { data } = await axios.patch(`/api/critterbase/captures/${payload.capture_id}`, {
      ...payload,
      force_create_release
    });
    return data;
  };

  /**
   * Delete a critter Capture.
   *
   * @async
   * @param {string} captureID
   * @returns {Promise<ICaptureResponse>} - The deleted capture.
   */
  const deleteCapture = async (captureID: string): Promise<ICaptureResponse> => {
    const { data } = await axios.delete(`/api/critterbase/captures/${captureID}`);

    return data;
  };

  return { createCapture, updateCapture, deleteCapture };
};

export { useCaptureApi };
