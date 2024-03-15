import { AxiosInstance } from 'axios';
import { ICreateCritterCapture } from 'features/surveys/view/survey-animals/animal';
import { isEqual } from 'lodash-es';

const useCaptureApi = (axios: AxiosInstance) => {
  const createCapture = async (payload: ICreateCritterCapture) => {
    const { data } = await axios.post(`/api/critterbase/captures/create`, payload);
    return data;
  };

  const updateCapture = async (payload: ICreateCritterCapture) => {
    const force_create_release =
      payload.capture_location.location_id === payload.release_location.location_id &&
      !isEqual(payload.capture_location, payload.release_location);

    const { data } = await axios.patch(`/api/critterbase/captures/${payload.capture_id}`, {
      ...payload,
      force_create_release
    });
    return data;
  };

  const deleteCapture = async (captureID: string) => {
    const { data } = await axios.delete(`/api/critterbase/captures/${captureID}`);

    return data;
  };

  return { createCapture, updateCapture, deleteCapture };
};

export { useCaptureApi };
