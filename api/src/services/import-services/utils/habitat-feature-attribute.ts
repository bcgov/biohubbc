import { HabitatFeatureQuantitativeDefinitionRecord } from '../../../database-models/habitat_feature_quantitative_definition';
import { HabitatFeatureQualitativeDefinitionWithOptions } from '../../../repositories/habitat-feature-repository/habitat-feature-repository.interface';
import { CaseInsensitiveMap } from '../../../utils/case-insensitive-map';
import { HabitatFeatureService } from '../../habitat-feature-services/habitat-feature-service';

export type HabitatFeatureDefinitionNameTypeDefinitionMap = CaseInsensitiveMap<
  string, // habitat feature definition name
  HabitatFeatureQualitativeDefinitionWithOptions | HabitatFeatureQuantitativeDefinitionRecord
>;

/**
 * Check if an object is a `HabitatFeatureQualitativeDefinitionRecord`
 *
 * Returns true if the object has the properties `options` and `habitat_feature_qualitative_definition_id`
 *
 * @param {unknown} item - The object to check
 * @returns {boolean} True if the object is a HabitatFeatureQualitativeDefinitionRecord
 */
export const isQualitativeHabitatFeatureTypeDefinition = (
  item: unknown
): item is HabitatFeatureQualitativeDefinitionWithOptions => {
  return (
    typeof item === 'object' && item != null && 'options' in item && 'habitat_feature_qualitative_definition_id' in item
  );
};

/**
 * Check if an object is a `HabitatFeatureQuantitativeDefinitionRecord`
 *
 * Returns true if the object has the properties `unit` and `habitat_feature_quantitative_definition_id`
 *
 * @param {any} item - The object to check
 * @returns {boolean} True if the object is a HabitatFeatureQuantitativeDefinitionRecord
 */
export const isQuantitativeHabitatFeatureTypeDefinition = (
  item: unknown
): item is HabitatFeatureQuantitativeDefinitionRecord => {
  return (
    typeof item === 'object' && item != null && 'unit' in item && 'habitat_feature_quantitative_definition_id' in item
  );
};

/**
 * Check if an object is a qualitative definition stub
 *
 * Returns true if the object has the properties `value` and `habitat_feature_qualitative_definition_id`
 *
 * Note: This function is NOT a typeguard, it is used to determine if an object
 * contains the minimum required properties to create a qualitative habitat feature attribute.
 *
 * @param {unknown} item - The object to check
 * @returns {boolean} True if the object is a qualitative habitat feature definition
 */
export const isQualitativeHabitatFeatureTypeDefinitionStub = (item: unknown): boolean => {
  return (
    typeof item === 'object' &&
    item != null &&
    'habitat_feature_qualitative_definition_option_id' in item &&
    'habitat_feature_qualitative_definition_id' in item
  );
};

/**
 * Check if an object is a quantitative definition stub
 *
 * Returns true if the object has the properties `value` and `habitat_feature_quantitative_definition_id`
 *
 * Note: This function is NOT a typeguard, it is used to determine if an object
 * contains the minimum required properties to create a quantitative habitat feature attribute.
 *
 * @param {unknown} item - The object to check
 * @returns {boolean} True if the object is a quantitative habitat feature definition
 */
export const isQuantitativeHabitatFeatureTypeDefinitionStub = (item: unknown): boolean => {
  return (
    typeof item === 'object' && item != null && 'value' in item && 'habitat_feature_quantitative_definition_id' in item
  );
};

/**
 * Get the habitat feature attribute name type definition map for a survey - case insensitive
 *
 * @param {string[]} habitatFeatureDefinitionNames The habitat feature attribute names
 * @param {HabitatFeatureService} habitatFeatureService The habitat feature service
 * @return {*}  {Promise<HabitatFeatureDefinitionNameTypeDefinitionMap>} A mapping of habitat feature definition names
 * to their respective type definitions
 */
export const getHabitatFeatureDefinitionNameTypeDefinitionMap = async (
  habitatFeatureDefinitionNames: string[],
  habitatFeatureService: HabitatFeatureService
): Promise<HabitatFeatureDefinitionNameTypeDefinitionMap> => {
  const definitionMap: HabitatFeatureDefinitionNameTypeDefinitionMap = new CaseInsensitiveMap();

  const [qualitativeHabitatFeatureDefinitions, quantitativeHabitatFeatureDefinitions] = await Promise.all([
    habitatFeatureService.findHabitatFeatureQualitativeDefinitions({ keywords: habitatFeatureDefinitionNames }),
    habitatFeatureService.findHabitatFeatureQuantitativeDefinitions({ keywords: habitatFeatureDefinitionNames })
  ]);

  // Map habitat feature attribute names to their respective habitat feature type definitions
  for (const item of qualitativeHabitatFeatureDefinitions) {
    definitionMap.set(item.name, item);
  }

  for (const item of quantitativeHabitatFeatureDefinitions) {
    definitionMap.set(item.name, item);
  }

  return definitionMap;
};
