import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  ICollectionUnitResponse
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
    qualitative: CBQualitativeMeasurementTypeDefinition[];
    quantitative: CBQuantitativeMeasurementTypeDefinition[];
  };
  marking_body_locations: {
    id: string;
    key: string;
    value: string;
  }[];
  ecological_units: ICollectionUnitResponse[];
}
