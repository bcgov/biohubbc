/**
 * A qualitative environment unit.
 */
export type EnvironmentUnit = 'millimeter' | 'centimeter' | 'meter' | 'milligram' | 'gram' | 'kilogram';

/**
 * A quantitative environment type definition.
 */
export type EnvironmentQuantitativeTypeDefinition = {
  environment_id: number;
  environment_quantitative_id: number;
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
  name: string;
  description: string | null;
};

/**
 * A qualitative environment type definition.
 */
export type EnvironmentQualitativeTypeDefinition = {
  environment_id: number;
  environment_qualitative_id: number | null;
  name: string;
  description: string | null;
  options: EnvironmentQualitativeOption[];
};

/**
 * Any environment type definition.
 */
export type EnvironmentType = EnvironmentQuantitativeTypeDefinition | EnvironmentQualitativeTypeDefinition;
