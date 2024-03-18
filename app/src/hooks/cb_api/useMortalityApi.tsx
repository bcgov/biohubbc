import { AxiosInstance } from 'axios';
import { ICreateCritterMortality } from 'features/surveys/view/survey-animals/animal';

const useMortalityApi = (axios: AxiosInstance) => {
 
  const createMortality = async (payload: ICreateCritterMortality) => {
    const { data } = await axios.post(`/api/critterbase/mortality/create`, payload);
    return data;
  };

  const updateMortality = async (payload: ICreateCritterMortality) => {
    const { data } = await axios.patch(`/api/critterbase/mortality/${payload.mortality_id}`, payload);
    return data;
  };

  const deleteMortality = async (mortalityID: string) => {
    const { data } = await axios.delete(`/api/critterbase/mortality/${mortalityID}`);

    return data;
  };

  return { createMortality, updateMortality, deleteMortality };
};

export { useMortalityApi };
