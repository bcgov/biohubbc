import { AxiosInstance } from 'axios';

export const useAuthentication = (axios: AxiosInstance) => {
  const signUp = async (): Promise<{ user_id: string }> => {
    const { data } = await axios.post('/api/critterbase/signup');

    return data;
  };

  return {
    signUp
  };
};
