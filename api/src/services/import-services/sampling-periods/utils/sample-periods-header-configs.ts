import { SampleSiteRecordExtendedNonSpatial } from '../../../../repositories/sample-site-repository/sample-site-repository';
import { TechniqueObject } from '../../../../repositories/technique-repository';
import { CSVCellValidator } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { getLookupIdCellValidator } from '../../../../utils/csv-utils/csv-header-configs';

/**
 * Get a cell validator for the sample site column.
 *
 * Note: This validator will mutate the cell value to the sample site ID.
 *
 * Rules:
 *  1. The sample site must exist in the survey
 *
 * @param {SampleSiteRecordExtendedNonSpatial[]} samplingSites - The sample sites
 * @returns {CSVCellValidator} - The cell validator
 */
export const getSampleSiteCellValidator = (samplingSites: SampleSiteRecordExtendedNonSpatial[]): CSVCellValidator => {
  return getLookupIdCellValidator(
    samplingSites.map((site) => ({ name: site.name, id: site.survey_sample_site_id })),
    {
      getError: (params) => `Sample site "${params.cell}" not found`,
      getSolution: (params) => `Add the sample site "${params.cell}" to the survey`,
      optional: false
    }
  );
};

/**
 * Get a cell validator for the method technique column.
 *
 * Note: This validator will mutate the cell value to the method technique ID.
 *
 * Rules:
 *  1. The method technique must exist in the survey
 *
 * @param {TechniqueObject[]} methodTechniques - The method techniques
 * @returns {CSVCellValidator} - The cell validator
 */
export const getMethodTechniqueCellValidator = (methodTechniques: TechniqueObject[]): CSVCellValidator => {
  return getLookupIdCellValidator(
    methodTechniques.map((technique) => ({ name: technique.name, id: technique.method_technique_id })),
    {
      getError: (params) => `Method technique "${params.cell}" not found`,
      getSolution: (params) => `Add the method technique "${params.cell}" to the survey`,
      optional: false
    }
  );
};
