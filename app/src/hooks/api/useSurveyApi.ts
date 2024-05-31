import { AxiosInstance, AxiosProgressEvent, CancelTokenSource } from 'axios';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import { ISurveyAdvancedFilters } from 'features/surveys/list/SurveysListContainer';
import { ICreateCritter } from 'features/surveys/view/survey-animals/animal';
import {
  IAnimalDeployment,
  ICreateAnimalDeployment,
  IDeploymentTimespan,
  ITelemetryPointCollection
} from 'features/surveys/view/survey-animals/telemetry-device/device';
import { ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { IGetReportDetails, IUploadAttachmentResponse } from 'interfaces/useProjectApi.interface';
import {
  ICreateSurveyRequest,
  ICreateSurveyResponse,
  IGetSurveyAttachmentsResponse,
  IGetSurveyForUpdateResponse,
  IGetSurveyForViewResponse,
  IGetSurveysForUserIdResponse,
  ISimpleCritterWithInternalId,
  SurveyUpdateObject
} from 'interfaces/useSurveyApi.interface';
import qs from 'qs';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with surveys.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSurveyApi = (axios: AxiosInstance) => {
  /**
   * Create a new project survey
   *
   * @param {ICreateSurveyRequest} survey
   * @return {*}  {Promise<ICreateSurveyResponse>}
   */
  const createSurvey = async (projectId: number, survey: ICreateSurveyRequest): Promise<ICreateSurveyResponse> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/create`, survey);

    return data;
  };

  /**
   * Get project survey details based on its ID for viewing purposes.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*} {Promise<IGetSurveyForViewResponse>}
   */
  const getSurveyForView = async (projectId: number, surveyId: number): Promise<IGetSurveyForViewResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/view`);

    return data;
  };

  /**
   * Get project survey details based on its ID for update purposes.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*} {Promise<IGetSurveyForUpdateResponse>}
   */
  const getSurveyForUpdate = async (projectId: number, surveyId: number): Promise<IGetSurveyForUpdateResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/update/get`);

    return data;
  };

  /**
   * Get surveys for a system user id.
   *
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {ISurveyAdvancedFilters} filterFieldData
   * @return {*} {Promise<IGetProjectsForUserIdResponse[]>}
   */
  const getSurveysForUserId = async (
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: ISurveyAdvancedFilters
  ): Promise<IGetSurveysForUserIdResponse> => {
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

    const { data } = await axios.get(`/api/survey/list${urlParamsString}`);

    return data;
  };

  /**
   * Fetches a subset of survey fields for all surveys under a project.
   *
   * @param {number} projectId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IGetSurveysListResponse[]>}
   */
  const getSurveysBasicFieldsByProjectId = async (
    projectId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<IGetSurveysForUserIdResponse> => {
    let urlParamsString = '';

    if (pagination) {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (pagination.sort) {
        params.append('sort', pagination.sort);
      }
      if (pagination.order) {
        params.append('order', pagination.order);
      }
      urlParamsString = `?${params.toString()}`;
    }

    const { data } = await axios.get(`/api/project/${projectId}/survey${urlParamsString}`);

    return data;
  };

  /**
   * Update an existing survey.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {SurveyUpdateObject} surveyData
   * @return {*}  {Promise<any>}
   */
  const updateSurvey = async (projectId: number, surveyId: number, surveyData: SurveyUpdateObject): Promise<any> => {
    const { data } = await axios.put(`/api/project/${projectId}/survey/${surveyId}/update`, surveyData);

    return data;
  };

  /**
   * Upload survey attachments.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {string} attachmentType
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: AxiosProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadSurveyAttachments = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<IUploadAttachmentResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);

    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/attachments/upload`, req_message, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  /**
   * Upload survey keyx files.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: AxiosProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<IUploadAttachmentResponse>}
   */
  const uploadSurveyKeyx = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<IUploadAttachmentResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);

    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/attachments/keyx/upload`,
      req_message,
      {
        cancelToken: cancelTokenSource?.token,
        onUploadProgress: onProgress
      }
    );

    return data;
  };

  /**
   * Upload survey reports.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {string} attachmentType
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: AxiosProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadSurveyReports = async (
    projectId: number,
    surveyId: number,
    file: File,

    attachmentMeta?: IReportMetaForm,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
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

    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/attachments/report/upload`,
      req_message,
      {
        cancelToken: cancelTokenSource?.token,
        onUploadProgress: onProgress
      }
    );

    return data;
  };

  /**
   * Update survey attachment metadata.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {string} attachmentType
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: AxiosProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const updateSurveyReportMetadata = async (
    projectId: number,
    surveyId: number,
    attachmentId: number,
    attachmentType: string,
    attachmentMeta: IEditReportMetaForm,
    revisionCount: number
  ): Promise<number> => {
    const requestBody = {
      attachment_type: attachmentType,
      attachment_meta: {
        title: attachmentMeta.title,
        year_published: attachmentMeta.year_published,
        authors: attachmentMeta.authors,
        description: attachmentMeta.description
      },
      revision_count: revisionCount
    };

    const { data } = await axios.put(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/metadata/update`,
      requestBody
    );

    return data;
  };

  /**
   * Get survey attachments based on survey ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @returns {*} {Promise<IGetSurveyAttachmentsResponse>}
   */
  const getSurveyAttachments = async (projectId: number, surveyId: number): Promise<IGetSurveyAttachmentsResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/attachments/list`);

    return data;
  };

  /**
   * Delete survey attachment based on survey and attachment ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @returns {*} {Promise<number>}
   */
  const deleteSurveyAttachment = async (
    projectId: number,
    surveyId: number,
    attachmentId: number,
    attachmentType: string
  ): Promise<number> => {
    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/delete`,
      {
        attachmentType
      }
    );

    return data;
  };

  /**
   * Delete survey based on survey ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @returns {*} {Promise<boolean>}
   */
  const deleteSurvey = async (projectId: number, surveyId: number): Promise<boolean> => {
    const { data } = await axios.delete(`/api/project/${projectId}/survey/${surveyId}/delete`);

    return data;
  };

  /**
   * Get survey attachment S3 url based on survey and attachment ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @returns {*} {Promise<string>}
   */
  const getSurveyAttachmentSignedURL = async (
    projectId: number,
    surveyId: number,
    attachmentId: number,
    attachmentType: string
  ): Promise<string> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/getSignedUrl`,
      {
        params: { attachmentType: attachmentType },
        paramsSerializer: (params) => {
          return qs.stringify(params);
        }
      }
    );

    return data;
  };

  /**
   * Get survey report metadata based on project ID, surveyID, attachment ID, and attachmentType
   *
   * @param {number} projectId
   * @params {number} surveyId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @returns {*} {Promise<string>}
   */
  const getSurveyReportDetails = async (
    projectId: number,
    surveyId: number,
    attachmentId: number
  ): Promise<IGetReportDetails> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/metadata/get`,
      {
        params: {},
        paramsSerializer: (params) => {
          return qs.stringify(params);
        }
      }
    );

    return data;
  };

  /**
   * Retrieve a list of critters associated with the given survey with details taken from critterbase.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @returns {ISimpleCritterWithInternalId[]}
   */
  const getSurveyCritters = async (projectId: number, surveyId: number): Promise<ISimpleCritterWithInternalId[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/critters`);
    return data;
  };

  /**
   * Create a critter and add it to the list of critters associated with this survey. This will create a new critter in Critterbase.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {Critter} critter Critter payload type
   * @returns Count of affected rows
   */
  const createCritterAndAddToSurvey = async (
    projectId: number,
    surveyId: number,
    critter: ICreateCritter
  ): Promise<ICritterSimpleResponse> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/critters`, critter);
    return data;
  };

  /**
   * Remove a critter from the survey. Will not delete critter in critterbase.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} critterId
   * @returns {*}
   */
  const removeCritterFromSurvey = async (projectId: number, surveyId: number, critterId: number): Promise<number> => {
    const { data } = await axios.delete(`/api/project/${projectId}/survey/${surveyId}/critters/${critterId}`);
    return data;
  };

  /**
   * Add a new deployment with associated device hardware metadata. Must include critterbase critter id.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} critterId
   * @param {IAnimalTelemetryDevice & {critter_id: string}} body
   * @returns {*}
   */
  const addDeployment = async (
    projectId: number,
    surveyId: number,
    critterId: number, // Survey critter_id
    body: ICreateAnimalDeployment // Critterbase critter_id
  ): Promise<number> => {
    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/critters/${critterId}/deployments`,
      body
    );
    return data;
  };

  /**
   * Update a deployment with a new time span.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} critterId
   * @param {IDeploymentTimespan} body
   * @returns {*}
   */
  const updateDeployment = async (
    projectId: number,
    surveyId: number,
    critterId: number,
    body: IDeploymentTimespan
  ): Promise<number> => {
    const { data } = await axios.patch(
      `/api/project/${projectId}/survey/${surveyId}/critters/${critterId}/deployments`,
      body
    );
    return data;
  };

  /**
   * Get all deployments associated with the given survey ID.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @returns {*}
   */
  const getDeploymentsInSurvey = async (projectId: number, surveyId: number): Promise<IAnimalDeployment[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/deployments`);
    return data;
  };

  /**
   * Get all telemetry points for a critter in a survey within a given time span.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} critterId
   * @param {string} startDate
   * @param {string} endDate
   * @return {*}  {Promise<ITelemetryPointCollection>}
   */
  const getCritterTelemetry = async (
    projectId: number,
    surveyId: number,
    critterId: number,
    startDate: string,
    endDate: string
  ): Promise<ITelemetryPointCollection> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/critters/${critterId}/telemetry?startDate=${startDate}&endDate=${endDate}`
    );
    return data;
  };
  /**
   * Removes a deployment. Will trigger removal in both SIMS and BCTW.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} critterId
   * @param {string} deploymentId
   * @returns {*}
   */
  const removeDeployment = async (
    projectId: number,
    surveyId: number,
    critterId: number,
    deploymentId: string
  ): Promise<string> => {
    const { data } = await axios.delete(
      `/api/project/${projectId}/survey/${surveyId}/critters/${critterId}/deployments/${deploymentId}`
    );
    return data;
  };

  return {
    createSurvey,
    getSurveyForView,
    getSurveysBasicFieldsByProjectId,
    getSurveyForUpdate,
    getSurveysForUserId,
    updateSurvey,
    uploadSurveyAttachments,
    uploadSurveyKeyx,
    uploadSurveyReports,
    updateSurveyReportMetadata,
    getSurveyReportDetails,
    getSurveyAttachments,
    deleteSurveyAttachment,
    getSurveyAttachmentSignedURL,
    deleteSurvey,
    getSurveyCritters,
    createCritterAndAddToSurvey,
    removeCritterFromSurvey,
    addDeployment,
    getDeploymentsInSurvey,
    updateDeployment,
    getCritterTelemetry,
    removeDeployment
  };
};

export default useSurveyApi;
