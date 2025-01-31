import { AxiosInstance } from 'axios';
import {
  ICreateSamplingSiteRequest,
  IEditSampleSiteRequest,
  IFindSampleSiteResponse,
  IGetSampleSiteDetails,
  IGetSampleSiteGeometryResponse,
  IGetSampleSiteRecordExtendedNonSpatialResponse
} from 'interfaces/useSamplingSiteApi.interface';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with search functionality
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSamplingSiteApi = (axios: AxiosInstance) => {
  /**
   * Create Sampling Sites
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ICreateSamplingSiteRequest} samplingSite
   * @return {*}  {Promise<void>}
   */
  const createSamplingSites = async (
    projectId: number,
    surveyId: number,
    samplingSite: ICreateSamplingSiteRequest
  ): Promise<void> => {
    await axios.post(`/api/project/${projectId}/survey/${surveyId}/sample-site`, samplingSite);
  };

  /**
   * Get Sample Sites, paginated or filtered by keyword.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} pagination
   * @return {*}  {Promise<IGetSampleSiteRecordExtendedNonSpatialResponse>}
   */
  const getSampleSites = async (
    projectId: number,
    surveyId: number,
    options?: {
      keyword?: string;
      pagination?: ApiPaginationRequestOptions;
    }
  ): Promise<IGetSampleSiteRecordExtendedNonSpatialResponse> => {
    const params = {
      keyword: options?.keyword,
      ...options?.pagination
    };

    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/sample-site`, {
      params
    });

    return data;
  };

  /**
   * Get Sample Sites geometry data
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<IGetSampleSiteGeometryResponse>}
   */
  const getSampleSitesGeometry = async (
    projectId: number,
    surveyId: number
  ): Promise<IGetSampleSiteGeometryResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/sample-site/spatial`);

    return data;
  };

  /**
   * Get Sample Site by ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} sampleSiteId
   * @return {*}  {Promise<IGetSampleSiteDetails>}
   */
  const getSampleSiteById = async (
    projectId: number,
    surveyId: number,
    sampleSiteId: number
  ): Promise<IGetSampleSiteDetails> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/sample-site/${sampleSiteId}`);
    return data;
  };

  /**
   * Find sample sites.
   *
   * @param {{
   *       survey_id?: number;
   *       keyword?: string;
   *       system_user_id?: number;
   *     }} [filterFieldData]
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IFindSampleSiteResponse>}
   */
  const findSampleSites = async (
    filterFieldData?: {
      survey_id?: number;
      keyword?: string;
      system_user_id?: number;
    },
    pagination?: ApiPaginationRequestOptions
  ): Promise<IFindSampleSiteResponse> => {
    const params = {
      ...filterFieldData,
      ...pagination
    };

    const { data } = await axios.get(`/api/sites`, {
      params
    });

    return data;
  };

  /**
   * Edit Sample Site
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} sampleSiteId
   * @param {IEditSamplingSiteRequest} sampleSite
   * @return {*}  {Promise<void>}
   */
  const editSampleSite = async (
    projectId: number,
    surveyId: number,
    sampleSiteId: number,
    sampleSite: IEditSampleSiteRequest
  ): Promise<void> => {
    await axios.put(`/api/project/${projectId}/survey/${surveyId}/sample-site/${sampleSiteId}`, sampleSite);
  };

  /**
   * Delete Sample Site
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} sampleSiteId
   * @return {*}  {Promise<void>}
   */
  const deleteSampleSite = async (projectId: number, surveyId: number, sampleSiteId: number): Promise<void> => {
    await axios.delete(`/api/project/${projectId}/survey/${surveyId}/sample-site/${sampleSiteId}`);
  };

  /**
   * Delete Sample Sites
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} surveySampleSiteIds
   * @return {*}  {Promise<void>}
   */
  const deleteSampleSites = async (
    projectId: number,
    surveyId: number,
    surveySampleSiteIds: number[]
  ): Promise<void> => {
    await axios.post(`/api/project/${projectId}/survey/${surveyId}/sample-site/delete`, { surveySampleSiteIds });
  };

  return {
    createSamplingSites,
    getSampleSites,
    getSampleSiteById,
    getSampleSitesGeometry,
    findSampleSites,
    editSampleSite,
    deleteSampleSite,
    deleteSampleSites
  };
};

export default useSamplingSiteApi;
