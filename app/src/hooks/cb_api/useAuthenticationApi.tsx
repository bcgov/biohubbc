import { AxiosInstance } from 'axios';

type CritterbaseUser = { user_id: string };

export const useAuthentication = (axios: AxiosInstance) => {
  /**
   * Signs up / registers a SIMS user for CritterbaseAPI.
   *
   * @async
   * @returns {Promise<CritterbaseUser | null>} Critterbase user ID or NULL if unable to sign up.
   */
  const signUp = async (): Promise<CritterbaseUser | null> => {
    try {
      const { data } = await axios.post('/api/critterbase/signup');
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
    return null;
  };

  return {
    signUp
  };
};
