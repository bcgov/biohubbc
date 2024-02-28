import { AxiosInstance, CancelTokenSource } from 'axios';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import { Critter } from 'features/surveys/view/survey-animals/animal';
import {
  IAnimalDeployment,
  IAnimalTelemetryDevice,
  IDeploymentTimespan,
  ITelemetryPointCollection
} from 'features/surveys/view/survey-animals/telemetry-device/device';
import {
  IGetAttachmentDetails,
  IGetReportDetails,
  IUploadAttachmentResponse
} from 'interfaces/useProjectApi.interface';
import { IGetSummaryResultsResponse, IUploadSummaryResultsResponse } from 'interfaces/useSummaryResultsApi.interface';
import {
  ICreateSurveyRequest,
  ICreateSurveyResponse,
  IDetailedCritterWithInternalId,
  IGetSurveyAttachmentsResponse,
  IGetSurveyForUpdateResponse,
  IGetSurveyForViewResponse,
  IGetSurveyListResponse,
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
   * Fetches a subset of survey fields for all surveys under a project.
   *
   * @param {number} projectId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IGetSurveysListResponse[]>}
   */
  const getSurveysBasicFieldsByProjectId = async (
    projectId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<IGetSurveyListResponse> => {
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
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadSurveyAttachments = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
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
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<IUploadAttachmentResponse>}
   */
  const uploadSurveyKeyx = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
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
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadSurveyReports = async (
    projectId: number,
    surveyId: number,
    file: File,

    attachmentMeta?: IReportMetaForm,
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
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
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
   * Get summary submission S3 url based on survey and summary ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<string>}
   */
  const getSummarySubmissionSignedURL = async (
    projectId: number,
    surveyId: number,
    summaryId: number
  ): Promise<string> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/summary/submission/${summaryId}/getSignedUrl`
    );

    return data;
  };

  /**
   * Delete summary submission based on summary ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} summaryId
   * @returns {*} {Promise<number>}
   */
  const deleteSummarySubmission = async (projectId: number, surveyId: number, summaryId: number): Promise<number> => {
    const { data } = await axios.delete(
      `/api/project/${projectId}/survey/${surveyId}/summary/submission/${summaryId}/delete`
    );

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

    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/summary/submission/upload`,
      req_message,
      {
        cancelToken: cancelTokenSource?.token,
        onUploadProgress: onProgress
      }
    );

    return data;
  };

  /**
   * Get observation submission S3 url based on survey and submission ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<string>}
   */
  const getSurveySummarySubmission = async (
    projectId: number,
    surveyId: number
  ): Promise<IGetSummaryResultsResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/summary/submission/get`);

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

  const getSurveyAttachmentDetails = async (
    projectId: number,
    surveyId: number,
    attachmentId: number
  ): Promise<IGetAttachmentDetails> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/get`, {
      params: {},
      paramsSerializer: (params: any) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  /**
   * Retrieve a list of critters associated with the given survey with details taken from critterbase.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @returns {ICritterDetailedResponse[]}
   */
  const getSurveyCritters = async (projectId: number, surveyId: number): Promise<IDetailedCritterWithInternalId[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/critters`);
    return data;
  };

  type CritterBulkCreationResponse = {
    create: {
      critters: number;
      collections: number;
      markings: number;
      locations: number;
      captures: number;
      mortalities: number;
      qualitative_measurements: number;
      quantitative_measurements: number;
      families: number;
      family_children: number;
      family_parents: number;
    };
  };

  const critterToPayloadTransform = (critter: Critter, ignoreTopLevel = false) => {
    return {
      critters: ignoreTopLevel
        ? []
        : [
            {
              critter_id: critter.critter_id,
              animal_id: critter.animal_id,
              sex: critter.sex,
              itis_tsn: critter.itis_tsn,
              wlh_id: critter.wlh_id
            }
          ],
      qualitative_measurements: critter.measurements.qualitative,
      quantitative_measurements: critter.measurements.quantitative,
      ...critter
    };
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
    critter: Critter
  ): Promise<CritterBulkCreationResponse> => {
    const payload = critterToPayloadTransform(critter);
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/critters`, payload);
    return data;
  };

  /**
   * Update a survey critter. Allows you to create, update, and delete associated rows like captures, mortalities etc in one request.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} critterId
   * @param {Critter} updateSection
   * @param {Critter | undefined} createSection
   * @returns {*}
   */
  const updateSurveyCritter = async (
    projectId: number,
    surveyId: number,
    critterId: number,
    updateSection: Critter,
    createSection: Critter | undefined
  ) => {
    const payload = {
      update: critterToPayloadTransform(updateSection),
      create: createSection ? critterToPayloadTransform(createSection, true) : undefined
    };
    const { data } = await axios.patch(`/api/project/${projectId}/survey/${surveyId}/critters/${critterId}`, payload);
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
    critterId: number,
    body: IAnimalTelemetryDevice & { critter_id: string }
  ): Promise<number> => {
    body.device_id = Number(body.device_id); //Turn this into validation class soon
    body.frequency = body.frequency != null ? Number(body.frequency) : undefined;
    body.frequency_unit = body.frequency_unit?.length ? body.frequency_unit : undefined;
    if (!body.deployments || body.deployments.length !== 1) {
      throw Error('Calling this with any amount other than 1 deployments currently unsupported.');
    }
    const flattened = { ...body, ...body.deployments[0] };
    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/critters/${critterId}/deployments`,
      flattened
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
    updateSurvey,
    uploadSurveyAttachments,
    uploadSurveyKeyx,
    uploadSurveyReports,
    updateSurveyReportMetadata,
    getSurveyReportDetails,
    getSurveyAttachmentDetails,
    uploadSurveySummaryResults,
    getSurveySummarySubmission,
    getSurveyAttachments,
    deleteSurveyAttachment,
    getSurveyAttachmentSignedURL,
    deleteSurvey,
    getSummarySubmissionSignedURL,
    deleteSummarySubmission,
    getSurveyCritters,
    createCritterAndAddToSurvey,
    removeCritterFromSurvey,
    addDeployment,
    getDeploymentsInSurvey,
    updateDeployment,
    getCritterTelemetry,
    removeDeployment,
    updateSurveyCritter
  };
};

export default useSurveyApi;
