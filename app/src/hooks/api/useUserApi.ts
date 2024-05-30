import { AxiosInstance } from 'axios';
import { IProjectAdvancedFilters } from 'components/search-filter/ProjectAdvancedFilters';
import { ISurveyAdvancedFilters } from 'features/surveys/list/SurveysListContainer';
import { IObservationsAdvancedFilters } from 'features/surveys/observations/list/ObservationsListContainer';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';
import { IgetProjectsForUserIdResponse, IGetUserProjectsListResponse } from 'interfaces/useProjectApi.interface';
import { IgetSurveysForUserIdResponse } from 'interfaces/useSurveyApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { ApiPaginationRequestOptions } from 'types/misc';

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
   * Get surveys for a system user id.
   *
   * @param {number} systemUserId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {ISurveyAdvancedFilters} filterFieldData
   * @return {*} {Promise<IgetProjectsForUserIdResponse[]>}
   */
  const getSurveysForUserId = async (
    systemUserId: number,
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: ISurveyAdvancedFilters
  ): Promise<IgetSurveysForUserIdResponse> => {
    const params = new URLSearchParams();

    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (pagination.sort) {
        params.append('sort', pagination.sort);
      }
      if (pagination.order) {
        params.append('order', pagination.order);
      }
    }

    if (filterFieldData) {
      Object.entries(filterFieldData).forEach(([key, value]) => {
        params.append(key, value);
      });
    }

    const urlParamsString = `?${params.toString()}`;

    const { data } = await axios.get(`/api/user/${systemUserId}/survey/list${urlParamsString}`);

    return data;
  };

  /**
   * Get observations for a system user id.
   *
   * @param {number} systemUserId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {ISurveyAdvancedFilters} filterFieldData
   * @return {*} {Promise<IgetProjectsForUserIdResponse[]>}
   */
  const getObservationsForUserId = async (
    systemUserId: number,
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: IObservationsAdvancedFilters
  ): Promise<IGetSurveyObservationsResponse> => {
    const params = new URLSearchParams();

    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (pagination.sort) {
        params.append('sort', pagination.sort);
      }
      if (pagination.order) {
        params.append('order', pagination.order);
      }
    }

    if (filterFieldData) {
      Object.entries(filterFieldData).forEach(([key, value]) => {
        params.append(key, value);
      });
    }

    const urlParamsString = `?${params.toString()}`;

    const { data } = await axios.get(`/api/user/${systemUserId}/observation/list${urlParamsString}`);

    return data;
  };

  /**
   * Get projects list (potentially based on filter criteria).
   *
   * @param {systemUserId} number
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {IProjectAdvancedFilters} filterFieldData
   * @return {*}  {Promise<IgetProjectsForUserIdResponse[]>}
   */
  const getProjectsForUserId = async (
    systemUserId: number,
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: IProjectAdvancedFilters
  ): Promise<IgetProjectsForUserIdResponse> => {
    const params = new URLSearchParams();

    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (pagination.sort) {
        params.append('sort', pagination.sort);
      }
      if (pagination.order) {
        params.append('order', pagination.order);
      }
    }

    if (filterFieldData) {
      Object.entries(filterFieldData).forEach(([key, value]) => {
        params.append(key, value);
      });
    }

    const urlParamsString = `?${params.toString()}`;

    const { data } = await axios.get(`/api/user/${systemUserId}/projects/list${urlParamsString}`);

    return data;
  };

  /**
   * Get projects for a system user id.
   *
   * @param {number} systemUserId
   * @return {*} {Promise<IgetProjectsForUserIdResponse[]>}
   */
  const getProjectList = async (systemUserId: number): Promise<IGetUserProjectsListResponse[]> => {
    const { data } = await axios.get(`/api/user/${systemUserId}/projects/get`);
    return data;
  };

  return {
    getUser,
    getSurveysForUserId,
    getObservationsForUserId,
    getProjectsForUserId,
    getProjectList,
    getUserById,
    getUsersList,
    deleteSystemUser,
    updateSystemUserRoles,
    searchSystemUser
  };
};

export default useUserApi;
