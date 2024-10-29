import { AxiosInstance } from 'axios';
import { IGetMarkdownResponse, IMarkdownFilterObject } from 'interfaces/useMarkdownApi.interface';
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
   * @param {IObservationsAdvancedFilters} filterObject
   * @return {*} {Promise<IFindProjectsResponse>}
   */
  const getMarkdown = async (filterObject: IMarkdownFilterObject): Promise<IGetMarkdownResponse> => {
    const params = {
      ...filterObject
    };

    const { data } = await axios.get('/api/markdown', { params, paramsSerializer: (params) => qs.stringify(params) });

    return data;
  };

  /**
   * Vote to increase or decrease the score of the markdown
   *
   * @param {number} score
   * @return {*} {Promise<IFindProjectsResponse>}
   */
  const vote = async (score: number): Promise<IGetMarkdownResponse> => {
    const { data } = await axios.post('/api/markdown', { score });

    return data;
  };

  return { getMarkdown, vote };
};
