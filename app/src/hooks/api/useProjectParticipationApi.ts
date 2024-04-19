import { AxiosInstance } from 'axios';
import {
  IAddProjectParticipant,
  IGetProjectParticipant,
  IGetUserProjectParticipantResponse
} from 'interfaces/useProjectApi.interface';

/**
 * Returns a set of supported api methods for working with project participants (members).
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useProjectParticipationApi = (axios: AxiosInstance) => {
  /**
   * Get all project participants.
   *
   * @param {number} projectId
   * @return {*}  {Promise<IGetProjectParticipants[]>}
   */
  const getProjectParticipants = async (projectId: number): Promise<IGetProjectParticipant[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/participants`);

    return data;
  };

  /**
   * Add new project participants.
   *
   * @param {number} projectId
   * @param {IAddProjectParticipant[]} participants
   * @return {*}  {Promise<boolean>} `true` if the request was successful, false otherwise.
   */
  const addProjectParticipants = async (
    projectId: number,
    participants: IAddProjectParticipant[]
  ): Promise<boolean> => {
    const { status } = await axios.post(`/api/project/${projectId}/participants`, { participants });

    return status === 200;
  };

  /**
   * Remove existing project participant.
   *
   * @param {number} projectId
   * @param {number} projectParticipationId
   * @return {*}  {Promise<boolean>} `true` if the request was successful, false otherwise.
   */
  const removeProjectParticipant = async (projectId: number, projectParticipationId: number): Promise<boolean> => {
    const { status } = await axios.delete(`/api/project/${projectId}/participants/${projectParticipationId}`);

    return status === 200;
  };

  /**
   * Update project participant role.
   *
   * @param {number} projectId
   * @param {number} projectParticipationId
   * @param {string} role
   * @return {*}  {Promise<boolean>}
   */
  const updateProjectParticipantRole = async (
    projectId: number,
    projectParticipationId: number,
    roleId: number
  ): Promise<boolean> => {
    const { status } = await axios.put(`/api/project/${projectId}/participants/${projectParticipationId}`, {
      roleId
    });

    return status === 200;
  };

  /**
   * Get the current user's project participation.
   *
   * @param {number} projectId
   * @return {*}  {Promise<IGetUserProjectParticipantResponse>}
   */
  const getUserProjectParticipant = async (projectId: number): Promise<IGetUserProjectParticipantResponse> => {
    const { data } = await axios.get<IGetUserProjectParticipantResponse>(`/api/project/${projectId}/participants/self`);

    return data;
  };

  /**
   * Add or update user roles for a project.
   *
   * @param {number} projectId
   * @param {{ user_id: number; role_id: number }[]} userRoles
   * @return {*}  {Promise<any>}
   */
  const postUserProjectRoles = async (
    projectId: number,
    userRoles: { user_id: number; role_id: number }[]
  ): Promise<any> => {
    const { data } = await axios.post(`/api/project/${projectId}/users`, { userRoles });
    return data;
  };

  return {
    getProjectParticipants,
    addProjectParticipants,
    removeProjectParticipant,
    updateProjectParticipantRole,
    getUserProjectParticipant,
    postUserProjectRoles
  };
};

export default useProjectParticipationApi;
