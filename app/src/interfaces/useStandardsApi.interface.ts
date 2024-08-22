import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  ICollectionUnit
} from './useCritterApi.interface';

interface IStandardNameDescription {
  name: string;
  description: string;
}

interface IQualitativeAttributeStandard extends IStandardNameDescription {
  options: IStandardNameDescription[];
}

interface IQuantitativeAttributeStandard extends IStandardNameDescription {
  unit: string;
}

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

/**
 * Data standards for methods
 *
 * @export
 * @interface IMethodStandard
 */
export interface IMethodStandard extends IStandardNameDescription {
  method_lookup_id: number;
  attributes: { qualitative: IQualitativeAttributeStandard[]; quantitative: IQuantitativeAttributeStandard[] };
}

/**
 * Data standards for environments
 *
 * @export
 * @interface IEnvironmentStandards
 */
export interface IEnvironmentStandards {
  qualitative: IQualitativeAttributeStandard[];
  quantitative: IQuantitativeAttributeStandard[];
}
