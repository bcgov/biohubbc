import { z } from 'zod';
import { HabitatFeatureQualitativeDefinitionRecord } from '../../database-models/habitat_feature_qualitative_definition';
import { HabitatFeatureQualitativeDefinitionOptionRecord } from '../../database-models/habitat_feature_qualitative_definition_option';
import { HabitatFeatureQuantitativeDefinitionRecord } from '../../database-models/habitat_feature_quantitative_definition';

export type FindHabitatFeatureDefinitionAdvancedFilters = {
  /**
   * Filter results by keyword.
   *
   * @type {string}
   */
  keyword?: string;
  /**
   * Filter results by survey ID.
   *
   * @type {number}
   */
  survey_id: number;
  /**
   * Filter results by ITIS TSNs.
   *
   * @type {number[]}
   */
  itis_tsns?: number[];
};

export const FindHabitatFeatureQuantitativeDefinition = HabitatFeatureQuantitativeDefinitionRecord;
export type FindHabitatFeatureQuantitativeDefinition = z.infer<typeof FindHabitatFeatureQuantitativeDefinition>;

export const FindHabitatFeatureQualitativeDefinition = HabitatFeatureQualitativeDefinitionRecord.extend({
  options: z.array(HabitatFeatureQualitativeDefinitionOptionRecord)
});
export type FindHabitatFeatureQualitativeDefinition = z.infer<typeof FindHabitatFeatureQualitativeDefinition>;

export const FindHabitatFeatureDefinitions = z.object({
  habitatFeatureQuantitativeDefinitions: z.array(HabitatFeatureQuantitativeDefinitionRecord),
  habitatFeatureQualitativeDefinitions: z.array(FindHabitatFeatureQualitativeDefinition)
});
export type FindHabitatFeatureDefinitions = z.infer<typeof FindHabitatFeatureDefinitions>;
