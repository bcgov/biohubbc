import { AxiosInstance } from 'axios';
import { IUserResponse } from 'interfaces/useUserApi.interface';

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
  const getUser = async (): Promise<IUserResponse> => {
    const { data } = await axios.get('/api/user/self');

    return data;
  };

  /**
   * Get user by their system user id.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<IGetUserResponse>}
   */
  const getUserById = async (systemUserId: number): Promise<IUserResponse> => {
    const { data } = await axios.get(`/api/user/${systemUserId}/get`);
    return data;
  };

  /**
   * Get user details for all users.
   *
   * @return {*}  {Promise<IGetUserResponse[]>}
   */
  const getUsersList = async (): Promise<IUserResponse[]> => {
    const { data } = await axios.get('/api/user/list');

    return data;
  };

  /**
   * Get user details for all users.
   *
   * @return {*}  {Promise<IGetUserResponse[]>}
   */
  const deleteSystemUser = async (systemUserId: number): Promise<number> => {
    const { data } = await axios.delete(`/api/user/${systemUserId}/delete`);

    return data;
  };

  /**
   * Get user details for all users.
   *
   * @return {*}  {Promise<IGetUserResponse[]>}
   */
  const updateSystemUserRoles = async (systemUserId: number, roleIds: number[]): Promise<IUserResponse> => {
    const { data } = await axios.patch(`/api/user/${systemUserId}/system-roles/update`, { roles: roleIds });

    return data;
  };

  const searchSystemUser = async (filter: string): Promise<IUserResponse[]> => {
    const { data } = await axios.get(`api/user?keyword=${filter}`);
    return data;
  };

  return {
    getUser,
    getUserById,
    getUsersList,
    deleteSystemUser,
    updateSystemUserRoles,
    searchSystemUser
  };
};

export default useUserApi;
