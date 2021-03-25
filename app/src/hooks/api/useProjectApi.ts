import { AxiosInstance } from 'axios';
import {
  ICreatePermitNoSamplingRequest,
  ICreatePermitNoSamplingResponse,
  ICreateProjectRequest,
  ICreateProjectResponse,
  IGetProjectMediaListResponse,
  IGetProjectForViewResponse,
  IGetProjectsListResponse,
  UPDATE_GET_ENTITIES,
  IGetProjectForUpdateResponse
} from 'interfaces/useProjectApi.interface';
import qs from 'qs';

/**
 * Returns a set of supported api methods for working with projects.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useProjectApi = (axios: AxiosInstance) => {
  /**
   * Get projects list.
   *
   * @return {*}  {Promise<IGetProjectsListResponse[]>}
   */
  const getProjectsList = async (): Promise<IGetProjectsListResponse[]> => {
    const { data } = await axios.get(`/api/projects`);

    return data;
  };

  /**
   * Get project details based on its ID for viewing purposes.
   *
   * @param {projectId} projectId
   * @return {*}  {Promise<IGetProjectForViewResponse>}
   */
  const getProjectForView = async (projectId: number): Promise<IGetProjectForViewResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/view`);

    return data;
  };

  /**
   * Get project details based on its ID for updating purposes.
   *
   * @param {projectId} projectId
   * @returns
   */
  const getProjectForUpdate = async (
    projectId: number,
    entities: UPDATE_GET_ENTITIES[]
  ): Promise<IGetProjectForUpdateResponse> => {
    const { data } = await axios.get(`api/project/${projectId}/update`, {
      params: { entity: entities },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  /**
   * Create a new project.
   *
   * @param {ICreateProjectRequest} project
   * @return {*}  {Promise<ICreateProjectResponse>}
   */
  const createProject = async (project: ICreateProjectRequest): Promise<ICreateProjectResponse> => {
    const { data } = await axios.post('/api/project', project);

    return data;
  };

  /**
   * Create a new project in which no sampling was conducted.
   *
   * @param {ICreatePermitNoSamplingRequest} project
   * @return {*}  {Promise<ICreatePermitNoSamplingResponse>}
   */
  const createPermitNoSampling = async (
    project: ICreatePermitNoSamplingRequest
  ): Promise<ICreatePermitNoSamplingResponse> => {
    const { data } = await axios.post('/api/permit-no-sampling', project);

    return data;
  };

  /**
   * Upload project artifacts.
   *
   * @param projectId
   * @param files
   * @return {*} {Promise<string[]>}
   */
  const uploadProjectArtifacts = async (projectId: number, files: File[]): Promise<string[]> => {
    const req_message = new FormData();

    files.forEach((file) => req_message.append('media', file));

    const { data } = await axios.post(`/api/projects/${projectId}/artifacts/upload`, req_message);

    return data;
  };

  /**
   * Fetch all media for the project.
   *
   * @return {*} {Promise<IGetProjectMediaListResponse[]>}
   */
  const getMediaList = async (projectId: string): Promise<IGetProjectMediaListResponse[]> => {
    const { data } = await axios.get(`/api/projects/${projectId}/artifacts/list`);

    if (!data || !data.length) {
      return [];
    }

    return data.map((file: any) => {
      return {
        file_name: file.key,
        encoded_file: ''
      };
    });
  };

  return {
    getProjectsList,
    createProject,
    createPermitNoSampling,
    getProjectForView,
    uploadProjectArtifacts,
    getMediaList,
    getProjectForUpdate
  };
};

export default useProjectApi;
