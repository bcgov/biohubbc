import { AxiosInstance } from 'axios';
import { IDraftResponse, IGetDraftResponse, IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';

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

  /**
   * Get drafts list.
   *
   * @return {*}  {Promise<IGetDraftsListResponse[]>}
   */
  const getDraftsList = async (): Promise<IGetDraftsListResponse[]> => {
    const { data } = await axios.get(`/api/drafts`);

    return data;
  };

  /**
   * Get details for a single draft based on its id.
   *
   * @return {*} {Promise<IGetDraftResponse>}
   */
  const getDraft = async (draftId: number): Promise<IGetDraftResponse> => {
    const { data } = await axios.get(`/api/draft/${draftId}/get`);

    return data;
  };

  /**
   * Delete a single draft based on its id.
   *
   * @return {*} {Promise<any>}
   */
  const deleteDraft = async (draftId: number): Promise<any> => {
    const { data } = await axios.delete(`api/draft/${draftId}/delete`);

    return data;
  };

  return {
    createDraft,
    updateDraft,
    getDraftsList,
    getDraft,
    deleteDraft
  };
};

export default useDraftApi;
