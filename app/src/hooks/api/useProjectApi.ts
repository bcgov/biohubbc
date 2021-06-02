import { AxiosInstance, CancelTokenSource } from 'axios';
import {
  ICreatePermitNoSamplingRequest,
  ICreatePermitNoSamplingResponse,
  ICreateProjectRequest,
  ICreateProjectResponse,
  IGetProjectForViewResponse,
  IGetProjectsListResponse,
  UPDATE_GET_ENTITIES,
  IGetProjectForUpdateResponse,
  IUpdateProjectRequest,
  IGetProjectAttachmentsResponse,
  IProjectAdvancedFilterRequest
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
    const { data } = await axios.post(`/api/projects`, filterFieldData || null);

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
   * Upload project attachments.
   *
   * @param {number} projectId
   * @param {File[]} files
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadProjectAttachments = async (
    projectId: number,
    files: File[],
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<string[]> => {
    const req_message = new FormData();

    files.forEach((file) => req_message.append('media', file));

    const { data } = await axios.post(`/api/project/${projectId}/attachments/upload`, req_message, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
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

  return {
    getProjectsList,
    createProject,
    createPermitNoSampling,
    getProjectForView,
    uploadProjectAttachments,
    getProjectForUpdate,
    updateProject,
    getProjectAttachments,
    getAttachmentSignedURL,
    deleteProjectAttachment,
    deleteFundingSource,
    addFundingSource
  };
};

export default useProjectApi;
