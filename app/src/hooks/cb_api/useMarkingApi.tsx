import { AxiosInstance } from 'axios';
import { ICreateCritterMarking } from 'features/surveys/view/survey-animals/animal';

const useMarkingApi = (axios: AxiosInstance) => {
  const createMarking = async (payload: ICreateCritterMarking) => {
    const { data } = await axios.post(`/api/critterbase/markings/create`, payload);
    return data;
  };

  const updateMarking = async (payload: ICreateCritterMarking) => {
    const { data } = await axios.patch(`/api/critterbase/markings/${payload.marking_id}`, payload);
    return data;
  };

  const deleteMarking = async (markingID: string) => {
    const { data } = await axios.delete(`/api/critterbase/markings/${markingID}`);

    return data;
  };

  return { createMarking, updateMarking, deleteMarking };
};

export { useMarkingApi };
