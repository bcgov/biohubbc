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
        //'api-key': cbApiKey,
        'keycloak-uuid': keycloakWrapper?.getUserGuid(),
        'user-id': keycloakWrapper?.getUserIdentifier()
      }
    };
  };

  /**
   * Fetch all code sets.
   *
   * @return {*}  {Promise<IGetAllCodeSetsResponse>}
   */
  const getAllMarkings = async (): Promise<any> => {
    const { data } = await axios.get('/api/cb/markings', getHeaders());
    return data;
  };

  const signUp = async (keycloak_guid: string, system_user_id: string): Promise<any> => {
    return axios.post('api/cb/signup', {
      keycloak_uuid: keycloak_guid,
      system_user_id: system_user_id,
      system_name: 'SIMS'
    });
  };

  return {
    getAllMarkings,
    signUp
  };
};

export default useCritterbaseApi;
