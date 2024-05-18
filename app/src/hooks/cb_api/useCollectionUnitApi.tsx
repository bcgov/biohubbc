import { AxiosInstance } from 'axios';
import { ICreateCritterCollectionUnit } from 'features/surveys/view/survey-animals/animal';
import { ICreateUpdateCritterCollectionUnitResponse } from 'interfaces/useCritterApi.interface';

const useCollectionUnitApi = (axios: AxiosInstance) => {
  /**
   * Create a critter collection-unit.
   *
   * @param {ICreateCritterCollectionUnit} payload
   * @return {*}  {Promise<ICreateUpdateCritterCollectionUnitResponse>} The created collection-unit.
   */
  const createCritterCollectionUnit = async (
    payload: ICreateCritterCollectionUnit
  ): Promise<ICreateUpdateCritterCollectionUnitResponse> => {
    const { data } = await axios.post(`/api/critterbase/collection-units/create`, payload);
    return data;
  };

  /**
   * Update a critter collection-unit.
   *
   * @param {ICreateCritterCollectionUnit} payload
   * @return {*}  {Promise<ICreateUpdateCritterCollectionUnitResponse>} The updated collection-unit.
   */
  const updateCritterCollectionUnit = async (
    payload: ICreateCritterCollectionUnit
  ): Promise<ICreateUpdateCritterCollectionUnitResponse> => {
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
   * @returns {Promise<void>}
   */
  const deleteCritterCollectionUnit = async (collectionUnitId: string): Promise<void> => {
    const { data } = await axios.delete(`/api/critterbase/collection-units/${collectionUnitId}`);

    return data;
  };

  return { createCritterCollectionUnit, updateCritterCollectionUnit, deleteCritterCollectionUnit };
};

export { useCollectionUnitApi };
