import { AxiosInstance } from 'axios';

const useMortalityApi = (axios: AxiosInstance) => {
 
  // TODO 
  // const createMortality = async (payload: ICreateCritterMortality) => {
  //   const { data } = await axios.post(`/api/critterbase/mortalitys/create`, payload);
  //   return data;
  // };

  // const updateMortality = async (payload: ICreateCritterMortality) => {
  //   const { data } = await axios.patch(`/api/critterbase/mortalitys/${payload.mortality_id}`, payload);
  //   return data;
  // };

  // const deleteMortality = async (mortalityID: string) => {
  //   const { data } = await axios.delete(`/api/critterbase/mortalitys/${mortalityID}`);

  //   return data;
  // };

  // return { createMortality, updateMortality, deleteMortality };
};

export { useMortalityApi };
