import { ICollectionUnitResponse, IQualitativeMeasurementResponse, IQuantitativeMeasurementResponse } from './useCritterApi.interface';

/**
 * Data standards for a taxon
 *
 * @export
 * @interface IGetSpeciesStandardsResponse
 */
export interface IGetSpeciesStandardsResponse {
  measurements: {
    qualitative: IQualitativeMeasurementResponse[];
    quantitative: IQuantitativeMeasurementResponse[];
  };
  marking_body_location: string[];
  ecological_units: ICollectionUnitResponse[]
}
