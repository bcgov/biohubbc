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
    const { data } = await axios.get('/api/user/self');

    return data;
  };

  /**
   * Get user from userId
   *
   * @param {number} userId
   * @return {*}  {Promise<IGetUserResponse>}
   */
  const getUserById = async (userId: number): Promise<IGetUserResponse> => {
    const { data } = await axios.get(`/api/user/${userId}/get`);
    return data;
  };

  /**
   * Get user details for all users.
   *
   * @return {*}  {Promise<IGetUserResponse[]>}
   */
  const getUsersList = async (): Promise<IGetUserResponse[]> => {
    const { data } = await axios.get('/api/user/list');

    return data;
  };

  /**
   * Get user details for all users.
   *
   * @return {*}  {Promise<IGetUserResponse[]>}
   */
  const deleteSystemUser = async (userId: number): Promise<number> => {
    const { data } = await axios.delete(`/api/user/${userId}/delete`);

    return data;
  };

  /**
   * Grant one or more system roles to a user.
   *
   * @param {number} userId
   * @param {number[]} roleIds
   * @return {*}  {Promise<number>}
   */
  const addSystemUserRoles = async (userId: number, roleIds: number[]): Promise<number> => {
    const { data } = await axios.post(`/api/user/${userId}/system-roles/create`, { roles: roleIds });

    return data;
  };

  /**
   * Get user details for all users.
   *
   * @return {*}  {Promise<IGetUserResponse[]>}
   */
  const updateSystemUserRoles = async (userId: number, roleIds: number[]): Promise<IGetUserResponse> => {
    const { data } = await axios.patch(`/api/user/${userId}/system-roles/update`, { roles: roleIds });

    return data;
  };

  return {
    getUser,
    getUserById,
    getUsersList,
    deleteSystemUser,
    updateSystemUserRoles,
    addSystemUserRoles
  };
};

export default useUserApi;
