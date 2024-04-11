import {
  ICollectionUnitResponse,
  IQualitativeMeasurementResponse,
  IQuantitativeMeasurementResponse
} from './useCritterApi.interface';

/**
 * Data standards for a taxon
 *
 * @export
 * @interface IGetSpeciesStandardsResponse
 */
export interface IGetSpeciesStandardsResponse {
  tsn: number;
  scientificName: string;
  measurements: {
    qualitative: IQualitativeMeasurementResponse[];
    quantitative: IQuantitativeMeasurementResponse[];
  };
  marking_body_locations: {
    id: string;
    key: string;
    value: string;
  }[];
  ecological_units: ICollectionUnitResponse[];
}
