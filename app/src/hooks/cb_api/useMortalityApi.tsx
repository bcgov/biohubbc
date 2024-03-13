import { AxiosInstance } from 'axios';

const useMortalityApi = (axios: AxiosInstance) => {
 
  // TODO type
  const createMortality = async (payload: any) => {
    const { data } = await axios.post(`/api/critterbase/mortality/create`, payload);
    return data;
  };

  // TODO type
  const updateMortality = async (payload: any) => {
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
