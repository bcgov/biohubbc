import { AxiosInstance } from 'axios';

const useAuthentication = (axios: AxiosInstance) => {
  const signUp = async (): Promise<{ user_id: string } | null> => {
    const { data } = await axios.post('/api/signup');
    return data;
  };

  return {
    signUp
  };
};

export { useAuthentication };
