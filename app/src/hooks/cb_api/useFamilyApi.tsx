import { AxiosInstance } from 'axios';

export type IFamily = {
  family_id: string;
  family_label: string;
};

export type IImmediateFamily = {
  parents: any[];
  siblings: any[];
  children: any;
};

export const useFamilyApi = (axios: AxiosInstance) => {
  const getAllFamilies = async (): Promise<IFamily[]> => {
    const { data } = await axios.get('/api/critterbase/family');

    return data;
  };

  const getImmediateFamily = async (family_id: string): Promise<IImmediateFamily> => {
    const { data } = await axios.get(`/api/critterbase/family/${family_id}`);

    return data;
  };

  return {
    getAllFamilies,
    getImmediateFamily
  };
};
