import { AxiosInstance } from 'axios';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';

export interface IMeasurementStub {
  taxon_measurement_id: string;
  measurement_name: string;
  min_value?: number;
  max_value?: number;
  unit?: string;
}

export const useXrefApi = (axios: AxiosInstance) => {
  const getTaxonMeasurements = async (taxon_id?: string): Promise<Array<IMeasurementStub> | undefined> => {
    if (!taxon_id) {
      return;
    }
    const { data } = await axios.get(`/api/critterbase/xref/taxon-measurements?taxon_id=${taxon_id}`);
    return data;
  };

  /**
   * Get measurement definitions by search terms.
   *
   * TODO: Update this method to use the search terms to filter the measurement definitions.
   *
   * @param {string[]} searchTerms
   * @return {*}  {Promise<CBMeasurementType[]>}
   */
  const getMeasurementTypeDefinitionsBySearachTerms = async (searchTerms: string[]): Promise<CBMeasurementType[]> => {
    // TODO: this needs to be updated when itis_tsn is swapped over in critter base
    const { data } = await axios.get(`/api/critterbase/xref/taxon-measurements`);

    return data;
  };

  return {
    getTaxonMeasurements,
    getMeasurementTypeDefinitionsBySearachTerms
  };
};
