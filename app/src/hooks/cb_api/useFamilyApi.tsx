import { AxiosInstance } from 'axios';

export type IFamily = {
  family_id: string;
  family_label: string;
}

const useFamilyApi = (axios: AxiosInstance) => {
  const getAllFamilies = async (): Promise<IFamily[]> => {
    try {
      const { data } = await axios.get('/api/family');
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
    return [];
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