import { AxiosInstance } from 'axios';
import { IGetMarkdownResponse, IMarkdownFilterObject, MarkdownScoreObject } from 'interfaces/useMarkdownApi.interface';
import qs from 'qs';

/**
 * Returns a set of supported api methods for working with observations.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const useMarkdownApi = (axios: AxiosInstance) => {
  /**
   * Get observations for a system user id.
   *
   * @param {IMarkdownFilterObject} filterObject
   * @return {Promise<IGetMarkdownResponse>}
   */
  const getMarkdown = async (filterObject: IMarkdownFilterObject): Promise<IGetMarkdownResponse> => {
    const params = {
      ...filterObject
    };

    const { data } = await axios.get('/api/markdown', { params, paramsSerializer: (params) => qs.stringify(params) });

    return data;
  };

  /**
   * Score to increase or decrease the score of the markdown
   *
   * @param {MarkdownScoreObject} markdownScoreObject
   * @return {Promise<void>}
   */
  const insertScore = async (markdownScoreObject: MarkdownScoreObject): Promise<void> => {
    const { data } = await axios.post(`/api/markdown/${markdownScoreObject.markdownId}`, {
      score: markdownScoreObject.score
    });

    return data;
  };

  return { getMarkdown, insertScore };
};
