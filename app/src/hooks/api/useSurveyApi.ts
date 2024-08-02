import { AxiosInstance, AxiosProgressEvent, CancelTokenSource } from 'axios';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import { ISurveyCritter } from 'contexts/animalPageContext';
import { ISurveyAdvancedFilters } from 'features/summary/list-data/survey/SurveysListFilterForm';
import { ICreateCritter } from 'features/surveys/view/survey-animals/animal';
import {
  IAllTelemetryPointCollection,
  IAnimalDeployment,
  ICreateAnimalDeploymentPostData
} from 'features/surveys/view/survey-animals/telemetry-device/device';
import { ICritterDetailedResponse, ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { IGetReportDetails, IUploadAttachmentResponse } from 'interfaces/useProjectApi.interface';
import {
  ICreateSurveyRequest,
  ICreateSurveyResponse,
  IFindSurveysResponse,
  IGetSurveyAttachmentsResponse,
  IGetSurveyForUpdateResponse,
  IGetSurveyForViewResponse,
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
   *
   * @param {number} projectId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IFindSurveysResponse>}
   */
  const getSurveysBasicFieldsByProjectId = async (
    projectId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<IFindSurveysResponse> => {
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
   * @returns {ICritterSimpleResponse[]}
   */
  const getSurveyCritters = async (projectId: number, surveyId: number): Promise<ICritterSimpleResponse[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/critters`);
    return data;
  };

  /**
   * Retrieve a list of critters associated with the given survey with details taken from critterbase.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} critterId
   * @returns {ICritterDetailedResponse}
   */
  const getCritterById = async (
    projectId: number,
    surveyId: number,
    critterId: number
  ): Promise<ICritterDetailedResponse> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/critters/${critterId}?format=detailed`
    );
    return data;
  };

  /**
   * Retrieve a list of critters associated with the given survey with details from critterbase, including
   * additional information such as captures and mortality
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @returns {ICritterDetailedResponse[]}
   */
  const getSurveyCrittersDetailed = async (
    projectId: number,
    surveyId: number
  ): Promise<ICritterDetailedResponse[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/critters?format=detailed`);
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
  ): Promise<ISurveyCritter> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/critters`, critter);
    return data;
  };

  /**
   * Remove critters from the survey. Will not delete critters in critterbase.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} critterId
   * @returns {*}
   */
  const removeCrittersFromSurvey = async (
    projectId: number,
    surveyId: number,
    critterIds: number[]
  ): Promise<number> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/critters/delete`, {
      critterIds: critterIds
    });
    return data;
  };

  /**
   * Create a new deployment with associated device hardware metadata. Must include critterbase critter id.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} critterId
   * @param {IAnimalTelemetryDevice & {critter_id: string}} body
   * @returns {*}
   */
  const createDeployment = async (
    projectId: number,
    surveyId: number,
    critterId: number,
    body: Omit<ICreateAnimalDeploymentPostData, 'critter_id'>
  ): Promise<{ deploymentId: number }> => {
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
   * @param {number} deploymentId
   * @param {IDeploymentTimespan} body
   * @returns {*}
   */
  const updateDeployment = async (
    projectId: number,
    surveyId: number,
    deploymentId: number,
    body: ICreateAnimalDeploymentPostData
  ): Promise<number> => {
    const { data } = await axios.put(`/api/project/${projectId}/survey/${surveyId}/deployments/${deploymentId}`, body);
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
   * Get deployment by Id, using the integer Id from SIMS instead of the BCTW GUID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} deploymentId
   * @returns {*}
   */
  const getDeploymentById = async (
    projectId: number,
    surveyId: number,
    deploymentId: number
  ): Promise<IAnimalDeployment> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/deployments/${deploymentId}`);
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
   * @return {*}  {Promise<IAllTelemetryPointCollection>}
   */
  const getCritterTelemetry = async (
    projectId: number,
    surveyId: number,
    critterId: number,
    startDate: string,
    endDate: string
  ): Promise<IAllTelemetryPointCollection> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/critters/${critterId}/telemetry?startDate=${startDate}&endDate=${endDate}`
    );
    return data;
  };

  /**
   * Ends a deployment. Will trigger removal in both SIMS and BCTW.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} critterId
   * @param {number} deploymentId
   * @returns {*}
   */
  const endDeployment = async (
    projectId: number,
    surveyId: number,
    critterId: number,
    deploymentId: number
  ): Promise<string> => {
    const { data } = await axios.delete(
      `/api/project/${projectId}/survey/${surveyId}/critters/${critterId}/deployments/${deploymentId}`
    );
    return data;
  };

  /**
   * Deletes a deployment. Will trigger deletion in SIMS and invalidates the deployment in BCTW.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} deploymentId
   * @returns {*}
   */
  const deleteDeployment = async (projectId: number, surveyId: number, deploymentId: number): Promise<string> => {
    const { data } = await axios.delete(`/api/project/${projectId}/survey/${surveyId}/deployments/${deploymentId}`);
    return data;
  };

  /**
   * Bulk upload Critters from CSV.
   *
   * @async
   * @param {File} file - Critters CSV.
   * @param {number} projectId
   * @param {number} surveyId
   * @returns {Promise<number[]>}
   */
  const importCrittersFromCsv = async (
    file: File,
    projectId: number,
    surveyId: number
  ): Promise<{ survey_critter_ids: number[] }> => {
    const formData = new FormData();

    formData.append('media', file);

    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/critters/import`, formData);

    return data;
  };

  return {
    createSurvey,
    getSurveyForView,
    getSurveysBasicFieldsByProjectId,
    getSurveyForUpdate,
    findSurveys,
    getDeploymentById,
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
    removeCrittersFromSurvey,
    createDeployment,
    getSurveyCrittersDetailed,
    getDeploymentsInSurvey,
    getCritterById,
    updateDeployment,
    getCritterTelemetry,
    endDeployment,
    deleteDeployment,
    importCrittersFromCsv
  };
};

export default useSurveyApi;
