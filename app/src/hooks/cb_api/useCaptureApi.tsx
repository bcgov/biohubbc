import { AxiosInstance } from 'axios';
import { ICreateCritterCapture } from 'features/surveys/view/survey-animals/animal';

const useCaptureApi = (axios: AxiosInstance) => {
  const createCapture = async (payload: ICreateCritterCapture) => {
    const { data } = await axios.post(`/api/critterbase/captures/create`, payload);
    return data;
  };

  const updateCapture = async (payload: ICreateCritterCapture) => {
    const { data } = await axios.patch(`/api/critterbase/captures/${payload.capture_id}`, payload);
    return data;
  };

  const deleteCapture = async (captureID: string) => {
    const { data } = await axios.delete(`/api/critterbase/captures/${captureID}`);

    return data;
  };

  return { createCapture, updateCapture, deleteCapture };
};

export { useCaptureApi };
