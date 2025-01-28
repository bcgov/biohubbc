import {
  ObservationSubCountQualitativeEnvironmentRecord,
  ObservationSubCountQuantitativeEnvironmentRecord,
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../../../repositories/observation-subcount-environment-repository';
import { CaseInsensitiveMap } from '../../../utils/case-insensitive-map';
import { ObservationSubCountEnvironmentService } from '../../observation-subcount-environment-service';

export type EnvironmentNameTypeDefinitionMap = CaseInsensitiveMap<
  string, // Environment name
  QualitativeEnvironmentTypeDefinition | QuantitativeEnvironmentTypeDefinition
>;

/**
 * Check if an object is a `QuantitativeEnvironmentTypeDefinition`
 *
 * Returns true if the object has the properties `unit` and `taxon_measurement_id`
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
 * Returns true if the object has the properties `options` and `taxon_measurement_id`
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
 * Check if an object is a `ObservationSubCountQualitativeEnvironmentRecord` - ie: the recorded environment
 *
 * Returns true if the object has the properties `environment_qualitative_option_id` and `environment_qualitative_id`
 *
 * @param {unknown} environment - The object to check
 * @returns {boolean} True if the object is a CBQualitativeMeasurement
 */
export const isQualitativeEnvironment = (
  environment: unknown
): environment is ObservationSubCountQualitativeEnvironmentRecord => {
  return (
    typeof environment === 'object' &&
    environment != null &&
    'environment_qualitative_option_id' in environment &&
    'environment_qualitative_id' in environment
  );
};

/**
 * Check if an object is a `ObservationSubCountQuantitativeEnvironmentRecord` - ie: the recorded environment
 *
 * Returns true if the object has the properties `value` and `environment_quantitative_id`
 *
 * @param {unknown} environment - The object to check
 * @returns {boolean} True if the object is a CBQuantitativeMeasurement
 */
export const isQuantitativeEnvironment = (
  environment: unknown
): environment is ObservationSubCountQuantitativeEnvironmentRecord => {
  return (
    typeof environment === 'object' &&
    environment != null &&
    'value' in environment &&
    'environment_quantitative_id' in environment
  );
};

export const getEnvironmentTypeDefinitionMap = async (
  surveyId: number,
  environmentService: ObservationSubCountEnvironmentService
): Promise<EnvironmentNameTypeDefinitionMap> => {
  const environmentMap: EnvironmentNameTypeDefinitionMap = new CaseInsensitiveMap();

  const [qualitativeEnvironments, quantitativeEnvironments] = await Promise.all([
    environmentService.getQualitativeEnvironmentTypeDefinitionsForSurvey(surveyId),
    environmentService.getQuantitativeEnvironmentTypeDefinitionsForSurvey(surveyId)
  ]);

  for (const environment of qualitativeEnvironments) {
    environmentMap.set(environment.name, environment);
  }

  for (const environment of quantitativeEnvironments) {
    environmentMap.set(environment.name, environment);
  }

  return environmentMap;
};
