import { AxiosInstance } from 'axios';

const useAuthentication = (axios: AxiosInstance) => {
  const signUp = async (): Promise<{ user_id: string } | null> => {
    try {
      const { data } = await axios.post('/api/critter-data/signup');
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

export { useAuthentication };
