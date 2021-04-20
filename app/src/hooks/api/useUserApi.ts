import { AxiosInstance } from 'axios';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';

/**
 * Returns a set of supported api methods for working with users.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useUserApi = (axios: AxiosInstance) => {
  /**
   * Get user details for the currently authenticated user.
   *
   * @return {*}  {Promise<IGetUserResponse>}
   */
  const getUser = async (): Promise<IGetUserResponse> => {
    const { data } = await axios.get('/api/user');

    return data;
  };

  /**
   * Get user details for all users.
   *
   * @return {*}  {Promise<IGetUserResponse[]>}
   */
  const getUsersList = async (): Promise<IGetUserResponse[]> => {
    const { data } = await axios.get('/api/users');

    return data;
  };

  return {
    getUser,
    getUsersList
  };
};

export default useUserApi;
