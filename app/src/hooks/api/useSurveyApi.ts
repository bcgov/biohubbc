import { AxiosInstance, CancelTokenSource } from 'axios';
import { IGetSummaryResultsResponse , IUploadSummaryResultsResponse} from 'interfaces/useSummaryResultsApi.interface';
import {
  ICreateSurveyRequest,
  ICreateSurveyResponse,
  IGetSurveyForViewResponse,
  IGetSurveysListResponse,
  IUpdateSurveyRequest,
  IGetSurveyForUpdateResponse,
  UPDATE_GET_SURVEY_ENTITIES,
  IGetSurveyAttachmentsResponse,
  SurveyPermits,
  SurveyFundingSources,
} from 'interfaces/useSurveyApi.interface';
import qs from 'qs';

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
   * Get surveys list.
   *
   * @param {number} projectId
   * @return {*}  {Promise<IGetSurveysListResponse[]>}
   */
  const getSurveysList = async (projectId: number): Promise<IGetSurveysListResponse[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/surveys`);

    return data;
  };

  /**
   * Get survey data for updating purposes.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<IGetSurveyForUpdateResponse>}
   */
  const getSurveyForUpdate = async (
    projectId: number,
    surveyId: number,
    entities: UPDATE_GET_SURVEY_ENTITIES[]
  ): Promise<IGetSurveyForUpdateResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/update`, {
      params: { entity: entities },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  /**
   * Update an existing survey.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ISurveyUpdateRequest} surveyData
   * @return {*}  {Promise<any>}
   */
  const updateSurvey = async (projectId: number, surveyId: number, surveyData: IUpdateSurveyRequest): Promise<any> => {
    const { data } = await axios.put(`/api/project/${projectId}/survey/${surveyId}/update`, surveyData);

    return data;
  };

  /**
   * Upload survey attachments.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadSurveyAttachments = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<string> => {
    const req_message = new FormData();

    req_message.append('media', file);

    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/attachments/upload`, req_message, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

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
   * Get permits that have not already been assigned to a survey, by project ID
   * Note: This is because a survey can have exactly one permit assigned to it and permits cannot be used more than once
   *
   * @param {number} projectId
   * @returns {*} {Promise<SurveyPermits[]>}
   */
  const getSurveyPermits = async (projectId: number): Promise<SurveyPermits[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/permits/list`);

    return data;
  };

  /**
   * Get funding sources for a survey by project ID
   *
   * @param {number} projectId
   * @returns {*} {Promise<SurveyFundingSources[]>}
   */
  const getSurveyFundingSources = async (projectId: number): Promise<SurveyFundingSources[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/funding-sources/list`);

    return data;
  };

  /**
   * Delete survey attachment based on survey and attachment ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} attachmentId
   * @returns {*} {Promise<number>}
   */
  const deleteSurveyAttachment = async (projectId: number, surveyId: number, attachmentId: number): Promise<number> => {
    const { data } = await axios.delete(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/delete`
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
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<string>}
   */
  const getSurveyAttachmentSignedURL = async (
    projectId: number,
    surveyId: number,
    attachmentId: number
  ): Promise<string> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/getSignedUrl`
    );

    return data;
  };

  /**
   * Get observation submission S3 url based on survey and submission ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<string>}
   */
  const getObservationSubmissionSignedURL = async (
    projectId: number,
    surveyId: number,
    submissionId: number
  ): Promise<string> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/observation/submission/${submissionId}/getSignedUrl`
    );

    return data;
  };

  /**
   * Publish/unpublish a survey.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {boolean} publish set to `true` to publish the survey, `false` to unpublish the survey.
   * @return {*}  {Promise<any>}
   */
  const publishSurvey = async (projectId: number, surveyId: number, publish: boolean): Promise<any> => {
    const { data } = await axios.put(`/api/project/${projectId}/survey/${surveyId}/publish`, { publish: publish });

    return data;
  };




  /**
   * Upload survey summary results.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
   const uploadSurveySummaryResults = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<IUploadSummaryResultsResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);

    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/summary/upload`, req_message, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };



  /**
   * Get observation submission S3 url based on survey and submission ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<string>}
   */
   const getSurveySummaryResults = async (
    projectId: number,
    surveyId: number
  ): Promise<IGetSummaryResultsResponse> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/summary/get`
    );

    return data;
  };



  return {
    createSurvey,
    getSurveyForView,
    getSurveysList,
    getSurveyForUpdate,
    updateSurvey,
    uploadSurveyAttachments,
    uploadSurveySummaryResults,
    getSurveySummaryResults,
    getSurveyAttachments,
    deleteSurveyAttachment,
    getSurveyAttachmentSignedURL,
    getObservationSubmissionSignedURL,
    deleteSurvey,
    getSurveyPermits,
    getSurveyFundingSources,
    publishSurvey
  };
};

export default useSurveyApi;
