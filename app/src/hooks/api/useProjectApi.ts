import { AxiosInstance, CancelTokenSource } from 'axios';
import {
  ICreateProjectRequest,
  ICreateProjectResponse,
  IGetProjectAttachmentsResponse,
  IGetProjectForUpdateResponse,
  IGetProjectForViewResponse,
  IGetProjectsListResponse,
  IProjectAdvancedFilterRequest,
  IUpdateProjectRequest,
  UPDATE_GET_ENTITIES
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
   * Get project attachments based on project ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<IGetProjectAttachmentsResponse>}
   */
  const getProjectAttachments = async (projectId: number): Promise<IGetProjectAttachmentsResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/attachments/list`);

    return data;
  };

  /**
   * Delete project based on project ID
   *
   * @param {number} projectId
   * @returns {*} {Promise<boolean>}
   */
  const deleteProject = async (projectId: number): Promise<boolean> => {
    const { data } = await axios.delete(`/api/project/${projectId}/delete`);

    return data;
  };

  /**
   * Delete project attachment based on project and attachment ID
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @returns {*} {Promise<number>}
   */
  const deleteProjectAttachment = async (projectId: number, attachmentId: number): Promise<number> => {
    const { data } = await axios.delete(`/api/project/${projectId}/attachments/${attachmentId}/delete`);

    return data;
  };

  /**
   * Get project attachment S3 url based on project and attachment ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<string>}
   */
  const getAttachmentSignedURL = async (projectId: number, attachmentId: number): Promise<string> => {
    const { data } = await axios.get(`/api/project/${projectId}/attachments/${attachmentId}/getSignedUrl`);

    return data;
  };

  /**
   * Get projects list (potentially based on filter criteria).
   *
   * @param {IProjectAdvancedFilterRequest} filterFieldData
   * @return {*}  {Promise<IGetProjectsListResponse[]>}
   */
  const getProjectsList = async (
    filterFieldData?: IProjectAdvancedFilterRequest
  ): Promise<IGetProjectsListResponse[]> => {
    const { data } = await axios.post(`/api/projects`, filterFieldData || {});

    return data;
  };

  /**
   * Get public facing (published) projects list.
   *
   * @return {*}  {Promise<IGetProjectsListResponse[]>}
   */
  const getPublicProjectsList = async (): Promise<IGetProjectsListResponse[]> => {
    const { data } = await axios.get(`/api/public/projects`);

    return data;
  };

  /**
   * Get project details based on its ID for viewing purposes.
   *
   * @param {number} projectId
   * @return {*} {Promise<IGetProjectForViewResponse>}
   */
  const getProjectForView = async (projectId: number): Promise<IGetProjectForViewResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/view`);

    return data;
  };

  /**
   * Get project details based on its ID for updating purposes.
   *
   * @param {number} projectId
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
   * Update an existing project.
   *
   * @param {number} projectId
   * @param {IUpdateProjectRequest} projectData
   * @return {*}  {Promise<any>}
   */
  const updateProject = async (projectId: number, projectData: IUpdateProjectRequest): Promise<any> => {
    const { data } = await axios.put(`api/project/${projectId}/update`, projectData);

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
   * Upload project attachments.
   *
   * @param {number} projectId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadProjectAttachments = async (
    projectId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<string> => {
    const req_message = new FormData();

    req_message.append('media', file);

    const { data } = await axios.post(`/api/project/${projectId}/attachments/upload`, req_message, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  /**
   * Make visibility of project attachment private.
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @return {*}  {Promise<any>}
   */
  const makeAttachmentPrivate = async (projectId: number, attachmentId: number): Promise<any> => {
    const { data } = await axios.put(`/api/project/${projectId}/attachments/${attachmentId}/makePrivate`);

    return data;
  };

  /**
   * Make visibility of project attachment public.
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @param {any} securityToken
   * @return {*}  {Promise<any>}
   */
  const makeAttachmentPublic = async (projectId: number, attachmentId: number, securityToken: any): Promise<any> => {
    const { data } = await axios.put(`/api/project/${projectId}/attachments/${attachmentId}/makePublic`, {
      securityToken
    });

    return data;
  };

  /**
   * Delete funding source based on project and funding source ID
   *
   * @param {number} projectId
   * @param {number} pfsId
   * @returns {*} {Promise<any>}
   */
  const deleteFundingSource = async (projectId: number, pfsId: number): Promise<any> => {
    const { data } = await axios.delete(`/api/project/${projectId}/funding-sources/${pfsId}/delete`);

    return data;
  };

  /**
   * Add new funding source based on projectId
   *
   * @param {number} projectId
   * @returns {*} {Promise<any>}
   */
  const addFundingSource = async (projectId: number, fundingSource: any): Promise<any> => {
    const { data } = await axios.post(`/api/project/${projectId}/funding-sources/add`, fundingSource);

    return data;
  };

  /**
   * Publish/unpublish a project.
   *
   * @param {number} projectId the project id
   * @param {boolean} publish set to `true` to publish the project, `false` to unpublish the project.
   * @return {*}  {Promise<any>}
   */
  const publishProject = async (projectId: number, publish: boolean): Promise<any> => {
    const { data } = await axios.put(`/api/project/${projectId}/publish`, { publish: publish });
    return data;
  };

  return {
    getProjectsList,
    createProject,
    getProjectForView,
    uploadProjectAttachments,
    getProjectForUpdate,
    updateProject,
    getProjectAttachments,
    getAttachmentSignedURL,
    deleteProjectAttachment,
    deleteFundingSource,
    addFundingSource,
    deleteProject,
    publishProject,
    getPublicProjectsList,
    makeAttachmentPublic,
    makeAttachmentPrivate
  };
};

export default useProjectApi;
