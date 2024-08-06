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

export interface IStandardNameDescription {
  name: string;
  description: string;
}

export interface IQualitativeAttributeStandard {
  name: string;
  description: string;
  options: IStandardNameDescription[];
}

export interface IQuantitativeAttributeStandard {
  name: string;
  description: string;
  unit: string;
}

export interface IMethodStandard extends IStandardNameDescription {
  method_lookup_id: number;
  attributes: { qualitative: IQualitativeAttributeStandard[]; quantitative: IQuantitativeAttributeStandard[] };
}

export interface IEnvironmentStandards {
  qualitative: IQualitativeAttributeStandard[];
  quantitative: IQuantitativeAttributeStandard[];
}
