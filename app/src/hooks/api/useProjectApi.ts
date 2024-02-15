import { AxiosInstance, CancelTokenSource } from 'axios';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import {
  ICreateProjectRequest,
  ICreateProjectResponse,
  IGetAttachmentDetails,
  IGetProjectAttachmentsResponse,
  IGetProjectForUpdateResponse,
  IGetProjectForViewResponse,
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
   * Get projects for a system user id.
   *
   * @param {number} systemUserId
   * @return {*} {Promise<IGetProjectsListResponse[]>}
   */
  const getAllUserProjectsForView = async (systemUserId: number): Promise<IGetUserProjectsListResponse[]> => {
    const { data } = await axios.get(`/api/user/${systemUserId}/projects/get`);
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
  ): Promise<IGetProjectsListResponse> => {
    const { data } = await axios.get(`/api/project/list?limit=10&page=1`, {
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
    getProjectAttachmentDetails
  };
};

export default useProjectApi;
