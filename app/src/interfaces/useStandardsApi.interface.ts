import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  ICollectionUnit
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
  markingBodyLocations: {
    id: string;
    key: string;
    value: string;
  }[];
  ecological_units: ICollectionUnit[];
}
