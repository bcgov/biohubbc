import { AxiosInstance } from 'axios';
import { IGetSurveyBlock, IGetSurveyBlockResponse } from 'interfaces/useBlockApi.interface';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with survey blocks
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useBlockApi = (axios: AxiosInstance) => {
  /**
   * Get survey block by id
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} surveyBlockId
   * @returns {*} {Promise<IGetSurveyBlock}
   */
  const getSurveyBlockById = async (
    projectId: number,
    surveyId: number,
    surveyBlockId: number
  ): Promise<IGetSurveyBlock> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/block/${surveyBlockId}`);

    return data;
  };

  /**
   * Get blocks for the survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {{
   *       keyword?: string;
   *       pagination?: ApiPaginationOptions;
   *     }} [options]
   * *
   * @returns {*} {Promise<IGetSurveyBlockResponse>}
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
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/block`, {
      params
    });

    return data;
  };

  /**
   * Delete survey blocks
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number[]} surveyBlockIds
   *
   * @returns {*} {Promise<void>}
   */
  const deleteBlocks = async (projectId: number, surveyId: number, surveyBlockIds: number[]): Promise<void> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/block/delete`, {
      surveyBlockIds
    });

    return data;
  };

  return { getSurveyBlockById, getSurveyBlocks, deleteBlocks };
};

export default useBlockApi;
