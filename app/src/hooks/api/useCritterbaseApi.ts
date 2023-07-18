import { AxiosInstance } from 'axios';

/**
 * Returns a set of supported api methods for working with projects.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useCritterbaseApi = (axios: AxiosInstance) => {
  /**
   * Fetch all code sets.
   *
   * @return {*}  {Promise<IGetAllCodeSetsResponse>}
   */
  const getAllMarkings = async (): Promise<any> => {
    const { data } = await axios.get('/api/cb/markings');

    return data;
  };

  return {
    getAllMarkings
  };
};

export default useCritterbaseApi;
