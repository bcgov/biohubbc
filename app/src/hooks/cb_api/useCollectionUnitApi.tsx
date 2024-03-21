import { AxiosInstance } from 'axios';
import { ICreateCritterCollectionUnit } from 'features/surveys/view/survey-animals/animal';
import { ICollectionUnitResponse } from 'interfaces/useCritterApi.interface';

const useCollectionUnitApi = (axios: AxiosInstance) => {
  /**
   * Create a critter collection-unit.
   *
   * @async
   * @param {ICreateCritterCollectionUnit} payload
   * @returns {Promise<ICollectionUnitResponse>} The created collection-unit.
   */
  const createCollectionUnit = async (payload: ICreateCritterCollectionUnit): Promise<ICollectionUnitResponse> => {
    const { data } = await axios.post(`/api/critterbase/collection-units/create`, payload);
    return data;
  };

  /**
   * Update a critter collection-unit.
   *
   * @async
   * @param {ICreateCritterCollectionUnit} payload
   * @returns {Promise<ICollectionUnitResponse>} The updated collection-unit.
   */
  const updateCollectionUnit = async (payload: ICreateCritterCollectionUnit): Promise<ICollectionUnitResponse> => {
    const { data } = await axios.patch(
      `/api/critterbase/collection-units/${payload.critter_collection_unit_id}`,
      payload
    );
    return data;
  };

  /**
   * Delete a critter collection-unit.
   *
   * @async
   * @param {string} collectionUnitId - critter_collection_unit_id.
   * @returns {Promise<ICollectionUnitResponse>} The deleted collection-unit.
   */
  const deleteCollectionUnit = async (collectionUnitId: string): Promise<ICollectionUnitResponse> => {
    const { data } = await axios.delete(`/api/critterbase/collection-units/${collectionUnitId}`);

    return data;
  };

  return { createCollectionUnit, updateCollectionUnit, deleteCollectionUnit };
};

export { useCollectionUnitApi };
