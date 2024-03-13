import { AxiosInstance } from 'axios';
import { ICreateCritterCollectionUnit } from 'features/surveys/view/survey-animals/animal';

const useCollectionUnitApi = (axios: AxiosInstance) => {
  const createCollectionUnit = async (payload: ICreateCritterCollectionUnit) => {
    const { data } = await axios.post(`/api/critterbase/collection-units/create`, payload);
    return data;
  };

  const updateCollectionUnit = async (payload: ICreateCritterCollectionUnit) => {
    const { data } = await axios.patch(
      `/api/critterbase/collection-units/${payload.critter_collection_unit_id}`,
      payload
    );
    return data;
  };

  const deleteCollectionUnit = async (collectionUnitId: string) => {
    const { data } = await axios.delete(`/api/critterbase/collection-units/${collectionUnitId}`);

    return data;
  };

  return { createCollectionUnit, updateCollectionUnit, deleteCollectionUnit };
};

export { useCollectionUnitApi };
