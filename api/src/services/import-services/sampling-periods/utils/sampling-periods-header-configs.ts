import { SampleSiteRecordExtendedNonSpatial } from '../../../../repositories/sample-site-repository/sample-site-repository';
import { TechniqueObject } from '../../../../repositories/technique-repository';
import { CSVCellValidator } from '../../../../utils/csv-utils/csv-config-validation.interface';

/**
 * Get a cell validator for the sampling site column.
 *
 * Note: This validator will mutate the cell value to the sample site ID.
 *
 * Rules:
 *  1. The sampling site must exist in the survey
 *
 * @param {SampleSiteRecordExtendedNonSpatial[]} samplingSites - The sampling sites
 * @returns {CSVCellValidator} - The cell validator
 */
export const getSamplingSiteCellValidator = (samplingSites: SampleSiteRecordExtendedNonSpatial[]): CSVCellValidator => {
  // TODO: Mac: Replace with case insensitive map
  // Map of sampling site names to IDs
  const samplingSiteMap = new Map<string, number>();
  const samplingSiteNames = samplingSites.map((site) => site.name);

  // Populate the sampling site map
  samplingSites.forEach((site) => {
    samplingSiteMap.set(site.name, site.survey_sample_site_id);
  });

  return (params) => {
    const sampleSiteId = samplingSiteMap.get(params.cell as string);

    if (sampleSiteId) {
      // Mutate the cell value to the sample site ID
      params.mutateCell = sampleSiteId;

      return [];
    }

    return [
      {
        error: `Sampling site "${params.cell}" not found`,
        solution: `Add the sampling site "${params.cell}" to the survey`,
        header: params.header,
        cell: params.cell,
        values: samplingSiteNames
      }
    ];
  };
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
  // TODO: Mac: Replace with case insensitive map
  // Map of method technique names to IDs
  const methodTechniqueMap = new Map<string, number>();
  const methodTechniqueNames = methodTechniques.map((technique) => technique.name);

  // Populate the method technique map
  methodTechniques.forEach((technique) => {
    methodTechniqueMap.set(technique.name, technique.method_technique_id);
  });

  return (params) => {
    const methodTechniqueId = methodTechniqueMap.get(params.cell as string);

    if (methodTechniqueId) {
      // Mutate the cell value to the method technique ID
      params.mutateCell = methodTechniqueId;

      return [];
    }

    return [
      {
        error: `Method technique "${params.cell}" not found`,
        solution: `Add the method technique "${params.cell}" to the survey`,
        header: params.header,
        cell: params.cell,
        values: methodTechniqueNames
      }
    ];
  };
};
