import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthStateContext } from 'contexts/authStateContext';
import { useContext } from 'react';

/**
 * Returns a set of supported api methods for working with projects.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useCritterbaseApi = (axios: AxiosInstance) => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  //const cbApiKey = process.env.CRITTERBASE_API_KEY;
  const getHeaders = (): AxiosRequestConfig => {
    return {
      headers: {
        'keycloak-uuid': keycloakWrapper?.getUserGuid(),
        'user-id': keycloakWrapper?.critterbaseUuid()
      }
    };
  };

  /**
   * Fetch all code sets.
   *
   * @return {*}  {Promise<IGetAllCodeSetsResponse>}
   */
  const getAllMarkings = async (): Promise<any> => {
    try {//
      const headers = getHeaders();
      console.log('Headers feeding to markings' + JSON.stringify(headers));
      const { data } = await axios.get('/api/critterbase/markings', headers);
      return data;
    } catch (e) {
      console.log(e);
    }
    return [];
  };

  interface ICbSignup {
    user_id: string;
  }
  const signUp = async (keycloak_guid: string, system_user_id: string): Promise<ICbSignup> => {
    const { data } = await axios.post('/api/critterbase/signup', {
      keycloak_uuid: keycloak_guid,
      system_user_id: system_user_id,
      system_name: 'SIMS'
    });
    return data;
  };

  return {
    getAllMarkings,
    signUp
  };
};

export default useCritterbaseApi;
