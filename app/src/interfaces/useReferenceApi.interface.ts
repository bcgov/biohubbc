/**
 * A quantitative unit.
 */
export type QuantitativeUnit =
  | 'millimeter'
  | 'centimeter'
  | 'meter'
  | 'milligram'
  | 'gram'
  | 'kilogram'
  | 'percent'
  | 'celsius'
  | 'ppt'
  | 'SCF'
  | 'degrees'
  | 'pH'
  | 'seconds'
  | 'meters squared'
  | 'count'
  | 'GHz'
  | 'Hz'
  | 'amps'
  | 'volts'
  | 'megapixels';

/**
 * A quantitative environment type definition.
 */
export type EnvironmentQuantitativeTypeDefinition = {
  environment_quantitative_id: string;
  name: string;
  description: string | null;
  min: number | null;
  max: number | null;
  unit: QuantitativeUnit | null;
};

/**
 * A qualitative environment option definition (ie. drop-down option).
 */
export type EnvironmentQualitativeOption = {
  environment_qualitative_option_id: string;
  environment_qualitative_id: string;
  name: string;
  description: string | null;
};

/**
 * A qualitative environment type definition.
 */
export type EnvironmentQualitativeTypeDefinition = {
  environment_qualitative_id: string;
  name: string;
  description: string | null;
  options: EnvironmentQualitativeOption[];
};

/**
 * Mixed environment columns type definition.
 */
export type EnvironmentType = {
  qualitative_environments: EnvironmentQualitativeTypeDefinition[];
  quantitative_environments: EnvironmentQuantitativeTypeDefinition[];
};

export type EnvironmentTypeIds = {
  qualitative_environments: EnvironmentQualitativeTypeDefinition['environment_qualitative_id'][];
  quantitative_environments: EnvironmentQuantitativeTypeDefinition['environment_quantitative_id'][];
};

/**
 * Technique quantitative attributes
 */
export interface ITechniqueAttributeQuantitative {
  method_lookup_attribute_quantitative_id: string;
  name: string;
  description: string | null;
  unit: string | null;
  min: number | null;
  max: number | null;
}

/**
 * Technique qualitative attributes
 */
export interface ITechniqueAttributeQualitativeOption {
  method_lookup_attribute_qualitative_option_id: string;
  name: string;
  description: string | null;
}

/**
 * Technique qualitative attributes
 */
export interface ITechniqueAttributeQualitative {
  method_lookup_attribute_qualitative_id: string;
  name: string;
  description: string | null;
  options: ITechniqueAttributeQualitativeOption[];
}

/**
 * Response for fetching technique attributes for a method lookup id
 */
export interface IGetTechniqueAttributes {
  method_lookup_id: number;
  quantitative_attributes: ITechniqueAttributeQuantitative[];
  qualitative_attributes: ITechniqueAttributeQualitative[];
}

export type VantageCategory = {
  vantage_category_id: number;
  name: string;
  description: string | null;
};

export type Vantage = {
  vantage_method_id: number;
  vantage_category_id: number;
  name: string;
};

/**
 * Response for fetching vantage reference records for a method lookup id
 */
export type GetVantageReferenceRecord = Vantage & { vantages: Vantage[] };
