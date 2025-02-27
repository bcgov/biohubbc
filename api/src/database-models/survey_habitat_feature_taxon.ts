import { z } from 'zod';

/**
 * Survey Habitat Feature Taxon Model.
 *
 * @description Data model for `survey_habitat_feature_taxon`.
 */
export const SurveyHabitatFeatureTaxonModel = z.object({
  survey_habitat_feature_taxon_id: z.number(),
  survey_habitat_feature_id: z.number(),
  itis_tsn: z.number(),
  itis_scientific_name: z.string(),
  comment: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyHabitatFeatureTaxonModel = z.infer<typeof SurveyHabitatFeatureTaxonModel>;

/**
 * Survey Habitat Feature Taxon Record.
 *
 * @description Data record for `survey_habitat_feature_taxon`.
 */
export const SurveyHabitatFeatureTaxonRecord = SurveyHabitatFeatureTaxonModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveyHabitatFeatureTaxonRecord = z.infer<typeof SurveyHabitatFeatureTaxonRecord>;
