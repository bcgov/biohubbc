import { AxiosInstance } from 'axios';
import { IGetUserProjectsListResponse } from 'interfaces/useProjectApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';

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
   * @return {*}  {Promise<ISystemUser>}
   */
  const getUser = async (): Promise<ISystemUser> => {
    const { data } = await axios.get('/api/user/self');

    return data;
  };

  /**
   * Get user by their system user id.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<ISystemUser>}
   */
  const getUserById = async (systemUserId: number): Promise<ISystemUser> => {
    const { data } = await axios.get(`/api/user/${systemUserId}/get`);
    return data;
  };

  /**
   * Get user details for all users.
   *
   * @return {*}  {Promise<ISystemUser[]>}
   */
  const getUsersList = async (): Promise<ISystemUser[]> => {
    const { data } = await axios.get('/api/user/list');

    return data;
  };

  /**
   * Get user details for all users.
   *
   * @return {*}  {Promise<ISystemUser[]>}
   */
  const deleteSystemUser = async (systemUserId: number): Promise<number> => {
    const { data } = await axios.delete(`/api/user/${systemUserId}/delete`);

    return data;
  };

  /**
   * Get user details for all users.
   *
   * @return {*}  {Promise<ISystemUser[]>}
   */
  const updateSystemUserRoles = async (systemUserId: number, roleIds: number[]): Promise<ISystemUser> => {
    const { data } = await axios.patch(`/api/user/${systemUserId}/system-roles/update`, { roles: roleIds });

    return data;
  };

  const searchSystemUser = async (filter: string): Promise<ISystemUser[]> => {
    const { data } = await axios.get(`api/user?keyword=${filter}`);
    return data;
  };

  /**
   * Get projects for a system user id.
   *
   * @param {number} systemUserId
   * @return {*} {Promise<IGetUserProjectsListResponse[]>}
   */
  const getProjectList = async (systemUserId: number): Promise<IGetUserProjectsListResponse[]> => {
    const { data } = await axios.get(`/api/user/${systemUserId}/projects/get`);
    return data;
  };

  return {
    getUser,
    getProjectList,
    getUserById,
    getUsersList,
    deleteSystemUser,
    updateSystemUserRoles,
    searchSystemUser
  };
};

export default useUserApi;
