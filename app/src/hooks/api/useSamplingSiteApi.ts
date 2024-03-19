import { AxiosInstance } from 'axios';
import { IEditSamplingSiteRequest } from 'features/surveys/observations/sampling-sites/edit/components/SampleSiteEditForm';
import { ICreateSamplingSiteRequest } from 'features/surveys/observations/sampling-sites/SamplingSitePage';
import { IGetSampleSiteResponse } from 'interfaces/useSurveyApi.interface';

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
   * Get Sample Sites
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<void>}
   */
  const getSampleSites = async (projectId: number, surveyId: number): Promise<IGetSampleSiteResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/sample-site`);

    return data;
  };

  /**
   * Get Sample Site by ID
   * TODO: Required? not used anywhere
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} sampleSiteId
   * @return {*}  {Promise<void>}
   */
  const getSampleSiteById = async (
    projectId: number,
    surveyId: number,
    sampleSiteId: number
  ): Promise<IGetSampleSiteResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/sample-site/${sampleSiteId}`);
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
    sampleSite: IEditSamplingSiteRequest
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
    editSampleSite,
    deleteSampleSite,
    deleteSampleSites
  };
};

export default useSamplingSiteApi;
