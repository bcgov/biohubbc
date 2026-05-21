import { HabitatFeatureQuantitativeDefinitionRecord } from '../../../../database-models/habitat_feature_quantitative_definition';
import { SurveyHabitatFeatureQualitativeValueRecord } from '../../../../database-models/survey_habitat_feature_qualitative_value';
import { SurveyHabitatFeatureQuantitativeValueRecord } from '../../../../database-models/survey_habitat_feature_quantitative_value';
import { HabitatFeatureQualitativeDefinitionWithOptions } from '../../../../repositories/habitat-feature-repository/habitat-feature-repository.interface';
import { CSVCellValidator, CSVError, CSVParams } from '../../../../utils/csv-utils/csv-config-validation.interface';
import {
  HabitatFeatureDefinitionNameTypeDefinitionMap,
  isQualitativeHabitatFeatureTypeDefinition,
  isQuantitativeHabitatFeatureTypeDefinition
} from '../../utils/habitat-feature-attribute';
import { validateQualitativeValue } from '../../utils/qualitative';
import { validateQuantitativeValue } from '../../utils/quantitative';
import { updateCSVRowState } from '../../utils/row-state';

/**
 * Get the dynamic habitat feature cell validator.
 *
 * Rules:
 *  1. The header must be a valid SIMS habitat feature attribute (qualitative or quantitative) or undefined
 *
 * @param {habitat feature} attributeMap The habitat feature attribute map
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getDynamicHabitatFeatureAttributeCellValidator = (
  attributeMap: HabitatFeatureDefinitionNameTypeDefinitionMap
): CSVCellValidator => {
  return (params) => {
    if (params.cell === undefined) {
      return [];
    }

    const habitatFeatureAttribute = attributeMap.get(params.header);

    if (!habitatFeatureAttribute) {
      return [
        {
          error: `Column header '${params.header}' does not exist`,
          solution: 'Use a valid habitat feature attribute as the header',
          values: Object.keys(attributeMap)
        }
      ];
    }

    // Header type is qualitative
    if (isQualitativeHabitatFeatureTypeDefinition(habitatFeatureAttribute)) {
      return habitatFeatureDynamicHeaderDependencies.validateQualitativeHabitatFeatureAttributeCell(
        params,
        habitatFeatureAttribute
      );
    }

    // Header type is quantitative
    if (isQuantitativeHabitatFeatureTypeDefinition(habitatFeatureAttribute)) {
      return habitatFeatureDynamicHeaderDependencies.validateQuantitativeHabitatFeatureAttributeCell(
        params,
        habitatFeatureAttribute
      );
    }

    // Can this path ever be reached?
    return [
      {
        error: 'Invalid habitat feature attribute type',
        solution: 'Use a supported habitat feature attribute type'
      }
    ];
  };
};

/**
 * Validate the qualitative habitat feature attribute cell value.
 *
 * @param {CSVParams} params The CSV params
 * @param {HabitatFeatureQualitativeDefinitionWithOptions} habitatFeatureQualitativeDefinition The qualitative habitat
 * feature definition
 * @returns {CSVError[]} The list of errors
 */
export const validateQualitativeHabitatFeatureAttributeCell = (
  params: CSVParams,
  habitatFeatureQualitativeDefinition: HabitatFeatureQualitativeDefinitionWithOptions
): CSVError[] => {
  const options = habitatFeatureQualitativeDefinition.options.map((option) => ({
    option_id: option.habitat_feature_qualitative_definition_option_id,
    option_name: option.name
  }));

  // Normalize the habitat feature type definition and validate the cell
  const result = validateQualitativeValue(params.cell, { options: options }, 'habitat feature attribute');

  // If the result is not a qualitative value it is a list of CSV errors
  if (typeof result !== 'string') {
    return result;
  }

  // Update the row state with the habitat_feature_qualitative_definition_id and
  // habitat_feature_qualitative_definition_option_id
  updateCSVRowState(params.row, {
    [params.header]: {
      habitat_feature_qualitative_definition_id:
        habitatFeatureQualitativeDefinition.habitat_feature_qualitative_definition_id,
      habitat_feature_qualitative_definition_option_id: result
    } satisfies Pick<
      SurveyHabitatFeatureQualitativeValueRecord,
      'habitat_feature_qualitative_definition_id' | 'habitat_feature_qualitative_definition_option_id'
    >
  });

  return [];
};

/**
 * Validate the quantitative habitat feature cell value.
 *
 * @param {CSVParams} params The CSV params
 * @param {HabitatFeatureQuantitativeDefinitionRecord} habitatFeatureQuantitativeDefinition The quantitative habitat
 * feature definition
 * @returns {CSVError[]} The list of errors
 */
export const validateQuantitativeHabitatFeatureAttributeCell = (
  params: CSVParams,
  habitatFeatureQuantitativeDefinition: HabitatFeatureQuantitativeDefinitionRecord
): CSVError[] => {
  // Normalize the habitat feature type definition and validate the cell
  const result = validateQuantitativeValue(
    params.cell,
    {
      min: habitatFeatureQuantitativeDefinition.min,
      max: habitatFeatureQuantitativeDefinition.max
    },
    'habitat feature attribute'
  );

  // If the result is not a quantitative value it is a list of CSV errors
  if (typeof result !== 'number') {
    return result;
  }

  // Update the row state with the habitat_feature_quantitative_definition_id and value
  updateCSVRowState(params.row, {
    [params.header]: {
      habitat_feature_quantitative_definition_id:
        habitatFeatureQuantitativeDefinition.habitat_feature_quantitative_definition_id,
      value: result
    } satisfies Pick<
      SurveyHabitatFeatureQuantitativeValueRecord,
      'habitat_feature_quantitative_definition_id' | 'value'
    >
  });

  return [];
};

export const habitatFeatureDynamicHeaderDependencies = {
  validateQualitativeHabitatFeatureAttributeCell,
  validateQuantitativeHabitatFeatureAttributeCell
};
