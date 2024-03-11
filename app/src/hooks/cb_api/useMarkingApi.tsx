import { AxiosInstance } from 'axios';
import { ICreateMarking } from 'features/surveys/view/survey-animals/animal';

const useMarkingApi = (axios: AxiosInstance) => {
  const createMarking = async (payload: ICreateMarking) => {
    const { data } = await axios.post(`/api/critterbase/markings/create`, payload);
    return data;
  };

  const updateMarking = async (payload: ICreateMarking) => {
    const { data } = await axios.patch(`/api/critterbase/markings/${payload.marking_id}`, payload);
    return data;
  };

  return { createMarking, updateMarking };
};

export { useMarkingApi };
