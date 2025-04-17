import axios from 'axios';

export const useCollectionApi = () => {
  const apiBaseUrl = '/api/collection';

  /**
   * Fetch all collections.
   *
   * @return {*}  {Promise<any[]>}
   */
  const getCollections = async (): Promise<any[]> => {
    const { data } = await axios.get(apiBaseUrl);
    return data;
  };

  /**
   * Fetch a collection by ID.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<any>}
   */
  const getCollectionById = async (collectionId: number): Promise<any> => {
    const { data } = await axios.get(`${apiBaseUrl}/${collectionId}`);
    return data;
  };

  /**
   * Create a new collection.
   *
   * @param {{ name: string; objectives: string }} collectionData
   * @return {*}  {Promise<any>}
   */
  const createCollection = async (collectionData: { name: string; objectives: string }): Promise<any> => {
    const { data } = await axios.post(apiBaseUrl, collectionData);
    return data;
  };

  /**
   * Update a collection by ID.
   *
   * @param {number} collectionId
   * @param {{ name?: string; objectives?: string }} collectionData
   * @return {*}  {Promise<any>}
   */
  const updateCollection = async (
    collectionId: number,
    collectionData: { name?: string; objectives?: string }
  ): Promise<any> => {
    const { data } = await axios.put(`${apiBaseUrl}/${collectionId}`, collectionData);
    return data;
  };

  /**
   * Delete a collection by ID.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<void>}
   */
  const deleteCollection = async (collectionId: number): Promise<void> => {
    await axios.delete(`${apiBaseUrl}/${collectionId}`);
  };

  return {
    getCollections,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollection
  };
};