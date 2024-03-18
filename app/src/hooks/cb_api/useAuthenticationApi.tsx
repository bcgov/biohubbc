import { AxiosInstance } from 'axios';

export const useAuthentication = (axios: AxiosInstance) => {
  const signUp = async (): Promise<{ user_id: string } | null> => {
    try {
      const { data } = await axios.post('/api/critterbase/signup');
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
    return null;
  };

  return {
    signUp
  };
};
