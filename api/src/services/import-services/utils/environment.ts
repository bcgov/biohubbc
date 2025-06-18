import {
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../../../repositories/observation-environment-repository';
import { CaseInsensitiveMap } from '../../../utils/case-insensitive-map';
import { ObservationEnvironmentService } from '../../observation-environment-service';

export type EnvironmentNameTypeDefinitionMap = CaseInsensitiveMap<
  string, // Environment name
  QualitativeEnvironmentTypeDefinition | QuantitativeEnvironmentTypeDefinition
>;

/**
 * Check if an object is a `QuantitativeEnvironmentTypeDefinition`
 *
 * Returns true if the object has the properties `unit` and `environment_quantitative_id`
 *
 * @param {any} environment - The object to check
 * @returns {boolean} True if the object is a QuantitativeEnvironmentTypeDefinition
 */
export const isQuantitativeEnvironmentTypeDefinition = (
  environment: unknown
): environment is QuantitativeEnvironmentTypeDefinition => {
  return (
    typeof environment === 'object' &&
    environment != null &&
    'unit' in environment &&
    'environment_quantitative_id' in environment
  );
};

/**
 * Check if an object is a `QualitativeEnvironmentTypeDefinition`
 *
 * Returns true if the object has the properties `options` and `environment_qualitative_id`
 *
 * @param {unknown} environment - The object to check
 * @returns {boolean} True if the object is a QualitativeEnvironmentTypeDefinition
 */
export const isQualitativeEnvironmentTypeDefinition = (
  environment: unknown
): environment is QualitativeEnvironmentTypeDefinition => {
  return (
    typeof environment === 'object' &&
    environment != null &&
    'options' in environment &&
    'environment_qualitative_id' in environment
  );
};

/**
 * Check if an object is a qualitative environment stub
 *
 * Returns true if the object has the properties `environment_qualitative_option_id` and `environment_qualitative_id`
 *
 * Note: This function is NOT a typeguard, it is used to determine if an object
 * contains the minimum required properties to create a qualitative environment.
 *
 * @param {unknown} environment - The object to check
 * @returns {boolean} True if the object is a qualitative environment
 */
export const isQualitativeEnvironmentStub = (environment: unknown): boolean => {
  return (
    typeof environment === 'object' &&
    environment != null &&
    'environment_qualitative_option_id' in environment &&
    'environment_qualitative_id' in environment
  );
};

/**
 * Check if an object is a quantitative environment stub
 *
 * Returns true if the object has the properties `value` and `environment_quantitative_id`
 *
 * Note: This function is NOT a typeguard, it is used to determine if an object
 * contains the minimum required properties to create a quantitative environment.
 *
 * @param {unknown} environment - The object to check
 * @returns {boolean} True if the object is a quantitative environment
 */
export const isQuantitativeEnvironmentStub = (environment: unknown): boolean => {
  return (
    typeof environment === 'object' &&
    environment != null &&
    'value' in environment &&
    'environment_quantitative_id' in environment
  );
};

/**
 * Get the environment name type definition map for a survey - case insensitive
 *
 * @param {string[]} environmentNames The environment names
 * @param {ObservationEnvironmentService} environmentService The environment service
 * @return {*}  {Promise<EnvironmentNameTypeDefinitionMap>} A mapping of environment names to their respective environment type definitions
 */
export const getEnvironmentNameTypeDefinitionMap = async (
  environmentNames: string[],
  environmentService: ObservationEnvironmentService
): Promise<EnvironmentNameTypeDefinitionMap> => {
  const environmentMap: EnvironmentNameTypeDefinitionMap = new CaseInsensitiveMap();

  const [qualitativeEnvironments, quantitativeEnvironments] = await Promise.all([
    environmentService.findQualitativeEnvironmentTypeDefinitions(environmentNames),
    environmentService.findQuantitativeEnvironmentTypeDefinitions(environmentNames)
  ]);

  // Map environment names to their respective environment type definitions
  for (const environment of qualitativeEnvironments) {
    environmentMap.set(environment.name, environment);
  }

  for (const environment of quantitativeEnvironments) {
    environmentMap.set(environment.name, environment);
  }

  return environmentMap;
};
