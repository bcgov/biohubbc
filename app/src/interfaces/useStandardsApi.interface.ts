import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  ICollectionUnit
} from './useCritterApi.interface';

/**
 * Data standards for a taxon
 *
 * @export
 * @interface ISpeciesStandards
 */
export interface ISpeciesStandards {
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
  ecologicalUnits: ICollectionUnit[];
}

export interface IEnvironmentStandards {
  qualitative: {
    name: string;
    description: string;
    options: {
      name: string;
      description: string;
    };
  }[];
  quantitative: { name: string; description: string }[];
}
