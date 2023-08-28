import { AxiosInstance } from 'axios';

export type IFamily = {
  family_id: string;
  family_label: string;
};

const useFamilyApi = (axios: AxiosInstance) => {
  const getAllFamilies = async (): Promise<IFamily[]> => {
    const { data } = await axios.get('/api/family');
    return data;
  };

  const getImmediateFamily = async (family_id: string): Promise<{ parents: any[]; siblings: any[]; children: any }> => {
    const { data } = await axios.get('/api/family/' + family_id);
    return data;
  };

  return {
    getAllFamilies,
    getImmediateFamily
  };
};

export { useFamilyApi };
