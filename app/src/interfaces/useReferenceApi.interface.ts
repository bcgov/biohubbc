/**
 * A qualitative environment unit.
 */
export type EnvironmentUnit = 'millimeter' | 'centimeter' | 'meter' | 'milligram' | 'gram' | 'kilogram';

/**
 * A quantitative environment type definition.
 */
export type EnvironmentQuantitativeTypeDefinition = {
  environment_quantitative_id: string;
  name: string;
  description: string | null;
  min: number | null;
  max: number | null;
  unit: EnvironmentUnit | null;
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
