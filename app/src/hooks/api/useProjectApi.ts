import { AxiosInstance, CancelTokenSource } from 'axios';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import {
  IAddProjectParticipant,
  ICreateProjectRequest,
  ICreateProjectResponse,
  IGetAttachmentDetails,
  IGetProjectAttachmentsResponse,
  IGetProjectForUpdateResponse,
  IGetProjectForViewResponse,
  IGetProjectParticipantsResponse,
  IGetProjectsListResponse,
  IGetReportDetails,
  IGetUserProjectsListResponse,
  IProjectAdvancedFilterRequest,
  IUpdateProjectRequest,
  IUploadAttachmentResponse,
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
   * Get projects from userId
   *
   * @param {number} userId
   * @return {*} {Promise<IGetProjectsListResponse[]>}
   */
  const getAllUserProjectsForView = async (userId: number): Promise<IGetUserProjectsListResponse[]> => {
    const { data } = await axios.get(`/api/user/${userId}/projects/get`);
    return data;
  };

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
   * @param {string} attachmentType
   * @returns {*} {Promise<number>}
   */
  const deleteProjectAttachment = async (
    projectId: number,
    attachmentId: number,
    attachmentType: string
  ): Promise<number> => {
    const { data } = await axios.post(`/api/project/${projectId}/attachments/${attachmentId}/delete`, {
      attachmentType
    });

    return data;
  };

  /**
   * Get project attachment S3 url based on project and attachment ID
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @return {*}  {Promise<string>}
   */
  const getAttachmentSignedURL = async (
    projectId: number,
    attachmentId: number,
    attachmentType: string
  ): Promise<string> => {
    const { data } = await axios.get(`/api/project/${projectId}/attachments/${attachmentId}/getSignedUrl`, {
      params: { attachmentType: attachmentType },
      paramsSerializer: (params: any) => {
        return qs.stringify(params);
      }
    });

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
    const { data } = await axios.get(`/api/project/list`, {
      params: filterFieldData,
      paramsSerializer: (params: any) => {
        return qs.stringify(params, {
          arrayFormat: 'repeat',
          filter: (_prefix: any, value: any) => value || undefined
        });
      }
    });

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
      paramsSerializer: (params: any) => {
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
    const { data } = await axios.post('/api/project/create', project);

    return data;
  };

  /**
   * Upload project attachments.
   *
   * @param {number} projectId
   * @param {File} file
   * @param {string} attachmentType
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadProjectAttachments = async (
    projectId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<IUploadAttachmentResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);

    const { data } = await axios.post(`/api/project/${projectId}/attachments/upload`, req_message, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  /**
   * Upload project reports.
   *
   * @param {number} projectId
   * @param {File} file
   * @param {IReportMetaForm} attachmentMeta
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<IUploadAttachmentResponse>}
   */
  const uploadProjectReports = async (
    projectId: number,
    file: File,
    attachmentMeta: IReportMetaForm,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<IUploadAttachmentResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);

    if (attachmentMeta) {
      req_message.append('attachmentMeta[title]', attachmentMeta.title);
      req_message.append('attachmentMeta[year_published]', String(attachmentMeta.year_published));
      req_message.append('attachmentMeta[description]', attachmentMeta.description);
      attachmentMeta.authors.forEach((authorObj, index) => {
        req_message.append(`attachmentMeta[authors][${index}][first_name]`, authorObj.first_name);
        req_message.append(`attachmentMeta[authors][${index}][last_name]`, authorObj.last_name);
      });
    }

    const { data } = await axios.post(`/api/project/${projectId}/attachments/report/upload`, req_message, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  /**
   * Update project attachment metadata.
   *
   * @param {number} projectId
   * @param {string} attachmentType
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const updateProjectReportMetadata = async (
    projectId: number,
    attachmentId: number,
    attachmentType: string,
    attachmentMeta: IEditReportMetaForm,
    revisionCount: number
  ): Promise<number> => {
    const obj = {
      attachment_type: attachmentType,
      attachment_meta: {
        title: attachmentMeta.title,
        year_published: attachmentMeta.year_published,
        authors: attachmentMeta.authors,
        description: attachmentMeta.description
      },
      revision_count: revisionCount
    };

    const { data } = await axios.put(`/api/project/${projectId}/attachments/${attachmentId}/metadata/update`, obj);
    return data;
  };

  /**
   * Delete funding source based on project and funding source ID
   *
   * @param {number} projectId
   * @param {number} pfsId
   * @return {*}  {Promise<number>}
   */
  const deleteFundingSource = async (projectId: number, pfsId: number): Promise<number> => {
    const { data } = await axios.delete(`/api/project/${projectId}/funding-sources/${pfsId}/delete`);

    return data;
  };

  /**
   * Add new funding source based on projectId
   *
   * @param {number} projectId
   * @param {*} fundingSource
   * @return {*}  {Promise<ICreateProjectResponse>}
   */
  const addFundingSource = async (projectId: number, fundingSource: any): Promise<ICreateProjectResponse> => {
    const { data } = await axios.post(`/api/project/${projectId}/funding-sources/add`, fundingSource);

    return data;
  };

  /**
   * Get project report metadata based on project ID, attachment ID, and attachmentType
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @return {*}  {Promise<IGetReportMetaData>}
   */
  const getProjectReportDetails = async (projectId: number, attachmentId: number): Promise<IGetReportDetails> => {
    const { data } = await axios.get(`/api/project/${projectId}/attachments/${attachmentId}/metadata/get`, {
      params: {},
      paramsSerializer: (params: any) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  const getProjectAttachmentDetails = async (
    projectId: number,
    attachmentId: number
  ): Promise<IGetAttachmentDetails> => {
    const { data } = await axios.get(`/api/project/${projectId}/attachments/${attachmentId}/get`, {
      params: {},
      paramsSerializer: (params: any) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  /**
   * Get all project participants.
   *
   * @param {number} projectId
   * @return {*}  {Promise<IGetProjectParticipantsResponse>}
   */
  const getProjectParticipants = async (projectId: number): Promise<IGetProjectParticipantsResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/participants/get`);

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
    const { status } = await axios.post(`/api/project/${projectId}/participants/create`, { participants });

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
    const { status } = await axios.delete(`/api/project/${projectId}/participants/${projectParticipationId}/delete`);

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
    const { status } = await axios.put(`/api/project/${projectId}/participants/${projectParticipationId}/update`, {
      roleId
    });

    return status === 200;
  };

  return {
    getAllUserProjectsForView,
    getProjectsList,
    createProject,
    getProjectForView,
    uploadProjectAttachments,
    uploadProjectReports,
    updateProjectReportMetadata,
    getProjectForUpdate,
    updateProject,
    getProjectAttachments,
    getAttachmentSignedURL,
    deleteProjectAttachment,
    deleteProject,
    getProjectReportDetails,
    getProjectAttachmentDetails,
    getProjectParticipants,
    addProjectParticipants,
    removeProjectParticipant,
    updateProjectParticipantRole
  };
};

export default useProjectApi;
