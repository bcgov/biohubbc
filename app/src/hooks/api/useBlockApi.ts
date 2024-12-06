import { AxiosInstance } from 'axios';
import { IGetSurveyBlockResponse } from 'interfaces/useBlockApi.interface';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with survey blocks
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useBlockApi = (axios: AxiosInstance) => {
  /**
   * Get survey blocks
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {{
   *       keyword?: string;
   *       pagination?: ApiPaginationOptions;
   *     }} [options]
   * *
   * @returns {*} {Promise<IGetProjectAttachmentsResponse>}
   */
  const getSurveyBlocks = async (
    projectId: number,
    surveyId: number,
    options?: {
      keyword?: string;
      pagination?: ApiPaginationRequestOptions;
    }
  ): Promise<IGetSurveyBlockResponse> => {
    const params = {
      keyword: options?.keyword,
      ...options?.pagination
    };
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/blocks`, {
      params
    });

    return data;
  };

  /**
   * Get survey blocks
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number[]} surveyBlockIds
   *
   * @returns {*} {Promise<IGetProjectAttachmentsResponse>}
   */
  const deleteBlocks = async (projectId: number, surveyId: number, surveyBlockIds: number[]): Promise<void> => {
    const params = {
      surveyBlockIds
    };
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/blocks`, {
      params
    });

    return data;
  };

  return { getSurveyBlocks, deleteBlocks };
};

export default useBlockApi;
