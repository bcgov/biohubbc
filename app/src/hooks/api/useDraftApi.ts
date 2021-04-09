import { AxiosInstance } from 'axios';
import { IDraftResponse } from 'interfaces/useDraftApi.interface';

/**
 * Returns a set of supported api methods for working with drafts.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useDraftApi = (axios: AxiosInstance) => {
  /**
   * Create a new draft record.
   *
   * @param {string} draftName
   * @param {unknown} draftData
   * @return {*}  {Promise<IDraftResponse>}
   */
  const createDraft = async (draftName: string, draftData: unknown): Promise<IDraftResponse> => {
    const { data } = await axios.post('/api/draft', { name: draftName, data: draftData });

    return data;
  };

  /**
   * Update a draft record.
   *
   * @param {number} id
   * @param {string} draftName
   * @param {unknown} draftData
   * @return {*}  {Promise<IDraftResponse>}
   */
  const updateDraft = async (id: number, draftName: string, draftData: unknown): Promise<IDraftResponse> => {
    const { data } = await axios.put('/api/draft', {
      id: id,
      name: draftName,
      data: draftData
    });

    return data;
  };

  return {
    createDraft,
    updateDraft
  };
};

export default useDraftApi;
