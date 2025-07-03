import { AxiosInstance, AxiosProgressEvent, CancelTokenSource } from 'axios';
import { ISurveyCritter } from 'contexts/animalPageContext';
import { ISurveyAdvancedFilters } from 'features/summary/list-data/survey/SurveysListFilterForm';
import { ICreateCritter } from 'features/surveys/view/survey-animals/animal';
import { SurveyExportConfig } from 'features/surveys/view/survey-export/SurveyExportForm';
import { IGetCollectionsResponse } from 'interfaces/useCollectionApi.interface';
import { ICritterDetailedResponse, ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import {
  ICreateSurveyRequest,
  ICreateSurveyResponse,
  IFindSurveysResponse,
  IGetReportDetails,
  IGetSurveyAttachmentsResponse,
  IGetSurveyForUpdateResponse,
  IGetSurveyForViewResponse,
  IPostSurveyMember,
  ISurveyMemberResponse,
  ISurveyMembersAdvancedFilters,
  IUpdateSurveyRequest,
  IUploadAttachmentResponse
} from 'interfaces/useSurveyApi.interface';
import { IAllTelemetryPointCollection } from 'interfaces/useTelemetryApi.interface';
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
  const createSurvey = async (survey: ICreateSurveyRequest): Promise<ICreateSurveyResponse> => {
    const { data } = await axios.post(`/api/survey/create`, survey);

    return data;
  };

  /**
   * Get project survey details based on its ID for viewing purposes.
   * @param {number} surveyId
   * @return {*} {Promise<IGetSurveyForViewResponse>}
   */
  const getSurveyForView = async (surveyId: number): Promise<IGetSurveyForViewResponse> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/view`);

    return data;
  };

  /**
   * Get project survey details based on its ID for update purposes.
   * @param {number} surveyId
   * @return {*} {Promise<IGetSurveyForUpdateResponse>}
   */
  const getSurveyForUpdate = async (surveyId: number): Promise<IGetSurveyForUpdateResponse> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/update/get`);

    return data;
  };

  /**
   * Get all collections that the survey belongs to
   *
   * @param {number} surveyId
   * @return {*} {Promise<IGetCollectionsResponse>}
   */
  const getCollectionsBySurveyId = async (surveyId: number): Promise<IGetCollectionsResponse> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/collection`);

    return data;
  };

  /**
   * Get surveys for a system user id.
   *
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {ISurveyAdvancedFilters} filterFieldData
   * @return {*} {Promise<IFindProjectsResponse[]>}
   */
  const findSurveys = async (
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: ISurveyAdvancedFilters
  ): Promise<IFindSurveysResponse> => {
    const params = {
      ...pagination,
      ...filterFieldData
    };

    const { data } = await axios.get('/api/survey', { params, paramsSerializer: (params) => qs.stringify(params) });

    return data;
  };

  /**
   * Fetches a subset of survey fields for all surveys under a project.
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IFindSurveysResponse>}
   */
  const getSurveysBasicFields = async (pagination?: ApiPaginationRequestOptions): Promise<IFindSurveysResponse> => {
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

    const { data } = await axios.get(`/api/survey${urlParamsString}`);

    return data;
  };

  /**
   * Gets members that have access to the Survey
   *
   * @param {number} surveyId
   * @param {ISurveyMembersAdvancedFilters} filters
   * @return {*}  {Promise<ISurveyMemberResponse>}
   */
  const getSurveyMembers = async (
    surveyId: number,
    filters?: ISurveyMembersAdvancedFilters
  ): Promise<ISurveyMemberResponse> => {
    const params = {
      ...filters
    };
    const { data } = await axios.get(`/api/survey/${surveyId}/members`, {
      params,
      paramsSerializer: (params) => qs.stringify(params)
    });

    return data;
  };

  /**
   * Add users to a survey
   *
   * @param {number} surveyId
   * @param {IPostSurveyMember[]} members
   * @return {*}  {Promise<ISurveyMemberResponse>}
   */
  const addSurveyMembers = async (surveyId: number, members?: IPostSurveyMember[]): Promise<ISurveyMemberResponse> => {
    const { data } = await axios.post(`/api/survey/${surveyId}/members`, { members });

    return data;
  };

  /**
   * Update an existing survey.
   * @param {number} surveyId
   * @param {IUpdateSurveyRequest} surveyData
   * @return {*}  {Promise<any>}
   */
  const updateSurvey = async (surveyId: number, surveyData: IUpdateSurveyRequest): Promise<any> => {
    const { data } = await axios.put(`/api/survey/${surveyId}/update`, surveyData);

    return data;
  };

  /**
   * Upload survey attachments.
   * @param {number} surveyId
   * @param {File} file
   * @param {string} attachmentType
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: AxiosProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadSurveyAttachments = async (
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<IUploadAttachmentResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);

    const { data } = await axios.post(`/api/survey/${surveyId}/attachments/upload`, req_message, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  /**
   * Get survey attachments based on survey ID
   * @param {number} surveyId
   * @returns {*} {Promise<IGetSurveyAttachmentsResponse>}
   */
  const getSurveyAttachments = async (surveyId: number): Promise<IGetSurveyAttachmentsResponse> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/attachments/list`);

    return data;
  };

  /**
   * Delete survey attachment based on survey and attachment ID
   * @param {number} surveyId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @returns {*} {Promise<number>}
   */
  const deleteSurveyAttachment = async (
    surveyId: number,
    attachmentId: number,
    attachmentType: string
  ): Promise<number> => {
    const { data } = await axios.post(`/api/survey/${surveyId}/attachments/${attachmentId}/delete`, {
      attachmentType
    });

    return data;
  };

  /**
   * Delete survey based on survey ID
   * @param {number} surveyId
   * @returns {*} {Promise<boolean>}
   */
  const deleteSurvey = async (surveyId: number): Promise<boolean> => {
    const { data } = await axios.delete(`/api/survey/${surveyId}/delete`);

    return data;
  };

  /**
   * Get survey attachment S3 url based on survey and attachment ID
   * @param {number} surveyId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @returns {*} {Promise<string>}
   */
  const getSurveyAttachmentSignedURL = async (
    surveyId: number,
    attachmentId: number,
    attachmentType: string
  ): Promise<string> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/attachments/${attachmentId}/getSignedUrl`, {
      params: { attachmentType: attachmentType },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  /**
   * Get survey report metadata based on project ID, surveyID, attachment ID, and attachmentType
   * @params {number} surveyId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @returns {*} {Promise<string>}
   */
  const getSurveyReportDetails = async (surveyId: number, attachmentId: number): Promise<IGetReportDetails> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/attachments/${attachmentId}/metadata/get`, {
      params: {},
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  /**
   * Retrieve a list of critters associated with the given survey with details taken from critterbase.
   * @param {number} surveyId
   * @returns {ICritterSimpleResponse[]}
   */
  const getSurveyCritters = async (surveyId: number): Promise<ICritterSimpleResponse[]> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/critters`);
    return data;
  };

  /**
   * Retrieve a list of critters associated with the given survey with details taken from critterbase.
   * @param {number} surveyId
   * @param {number} critterId
   * @param {string} expand List of related resources to include in the response
   * @return {*}  {Promise<ICritterDetailedResponse>}
   */
  const getCritterById = async (
    surveyId: number,
    critterId: number,
    expand?: ['attachments']
  ): Promise<ICritterDetailedResponse> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/critters/${critterId}`, {
      params: {
        format: 'detailed',
        expand: expand
      }
    });
    return data;
  };

  /**
   * Retrieve a list of critters associated with the given survey with details from critterbase, including
   * additional information such as captures and mortality
   * @param {number} surveyId
   * @return {*}  {Promise<ICritterDetailedResponse[]>}
   */
  const getSurveyCrittersDetailed = async (surveyId: number): Promise<ICritterDetailedResponse[]> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/critters?format=detailed`);
    return data;
  };

  /**
   * Create a critter and add it to the list of critters associated with this survey. This will create a new critter in Critterbase.
   * @param {number} surveyId
   * @param {ICreateCritter} critter
   * @return {*}  {Promise<ISurveyCritter>}
   */
  const createCritterAndAddToSurvey = async (surveyId: number, critter: ICreateCritter): Promise<ISurveyCritter> => {
    const { data } = await axios.post(`/api/survey/${surveyId}/critters`, critter);
    return data;
  };

  /**
   * Update a critter and add it to the list of critters associated with this survey. This will update the critter in Critterbase.
   * @param {number} surveyId
   * @param {number} simsCritterId
   * @param {ICreateCritter} critter
   * @return {*} {Promise<void>}
   */
  const updateCritterAndAddToSurvey = async (
    surveyId: number,
    simsCritterId: number,
    critter: ICreateCritter
  ): Promise<void> => {
    const { data } = await axios.patch(`/api/survey/${surveyId}/critters/${simsCritterId}`, critter);
    return data;
  };

  /**
   * Remove critters from the survey. Will not delete critters in critterbase.
   * @param {number} surveyId
   * @param {number[]} critterIds
   * @return {*}  {Promise<number>}
   */
  const removeCrittersFromSurvey = async (surveyId: number, critterIds: number[]): Promise<number> => {
    const { data } = await axios.post(`/api/survey/${surveyId}/critters/delete`, {
      critterIds: critterIds
    });
    return data;
  };

  /**
   * Get all telemetry points for a critter in a survey within a given time span.
   *
   * TODO: Unused?
   * @param {number} surveyId
   * @param {number} critterId
   * @param {string} startDate
   * @param {string} endDate
   * @return {*}  {Promise<IAllTelemetryPointCollection>}
   */
  const getCritterTelemetry = async (
    surveyId: number,
    critterId: number,
    startDate: string,
    endDate: string
  ): Promise<IAllTelemetryPointCollection> => {
    const { data } = await axios.get(
      `/api/survey/${surveyId}/critters/${critterId}/telemetry?startDate=${startDate}&endDate=${endDate}`
    );
    return data;
  };

  /**
   * Bulk upload Critters from CSV.
   *
   * @param {File} file
   
   * @param {number} surveyId
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: AxiosProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<{ survey_critter_ids: number[] }>}
   */
  const importCrittersFromCsv = async (
    file: File,

    surveyId: number,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<{ survey_critter_ids: number[] }> => {
    const formData = new FormData();

    formData.append('media', file);

    const { data } = await axios.post(`/api/survey/${surveyId}/critters/import`, formData, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  /**
   * Bulk upload Captures from CSV.
   *
   * @async
   * @param {File} file - Captures CSV.
   
   * @param {number} surveyId
   * @returns {Promise<number[]>}
   */
  const importCapturesFromCsv = async (
    file: File,

    surveyId: number,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<{ survey_critter_ids: number[] }> => {
    const formData = new FormData();

    formData.append('media', file);

    const { data } = await axios.post(`/api/survey/${surveyId}/critters/captures/import`, formData, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  /**
   * Bulk upload Mortalities from CSV.
   *
   * @async
   * @param {File} file - Captures CSV.
   
   * @param {number} surveyId
   * @returns {Promise<number[]>}
   */
  const importMortalitiesFromCsv = async (
    file: File,

    surveyId: number,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<{ survey_critter_ids: number[] }> => {
    const formData = new FormData();

    formData.append('media', file);

    const { data } = await axios.post(`/api/survey/${surveyId}/critters/mortality/import`, formData, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  /**
   * Bulk upload Markings from CSV.
   *
   * @async
   * @param {File} file - Captures CSV.
   
   * @param {number} surveyId
   * @returns {Promise<number[]>}
   */
  const importMarkingsFromCsv = async (
    file: File,

    surveyId: number,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<{ survey_critter_ids: number[] }> => {
    const formData = new FormData();

    formData.append('media', file);

    const { data } = await axios.post(`/api/survey/${surveyId}/critters/markings/import`, formData, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  /**
   * Bulk upload Measurements from CSV.
   *
   * @async
   * @param {File} file - Captures CSV.
   
   * @param {number} surveyId
   * @returns {Promise<number[]>}
   */
  const importMeasurementsFromCsv = async (
    file: File,

    surveyId: number,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<{ survey_critter_ids: number[] }> => {
    const formData = new FormData();

    formData.append('media', file);

    const { data } = await axios.post(`/api/survey/${surveyId}/critters/measurements/import`, formData, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  /**
   * Initiates a data export for a survey.
   * @param {number} surveyId
   * @param {SurveyExportConfig} exportConfig
   * @return {*}  {Promise<{ presignedS3Urls: string[] }>}
   */
  const exportData = async (
    surveyId: number,
    exportConfig: SurveyExportConfig
  ): Promise<{ presignedS3Urls: string[] }> => {
    const { data } = await axios.post(`/api/survey/${surveyId}/export`, { config: exportConfig });

    return data;
  };

  return {
    createSurvey,
    getSurveyForView,
    getSurveysBasicFields,
    getSurveyForUpdate,
    getSurveyMembers,
    addSurveyMembers,
    findSurveys,
    updateSurvey,
    uploadSurveyAttachments,
    getSurveyReportDetails,
    getCollectionsBySurveyId,
    getSurveyAttachments,
    deleteSurveyAttachment,
    getSurveyAttachmentSignedURL,
    deleteSurvey,
    getSurveyCritters,
    createCritterAndAddToSurvey,
    updateCritterAndAddToSurvey,
    removeCrittersFromSurvey,
    getSurveyCrittersDetailed,
    getCritterById,
    getCritterTelemetry,
    importCrittersFromCsv,
    importCapturesFromCsv,
    importMortalitiesFromCsv,
    importMarkingsFromCsv,
    importMeasurementsFromCsv,
    exportData
  };
};

export default useSurveyApi;
