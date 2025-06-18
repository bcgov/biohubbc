import { z } from 'zod';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVCellValidator } from '../../../utils/csv-utils/csv-config-validation.interface';
import { validateZodCell } from '../../../utils/csv-utils/csv-header-configs';
import { ICritterDetailed } from '../../critterbase-service';
import { MortalityCSVStaticHeader } from './import-mortality-service';

/**
 * Get the mortality date cell validator.
 *
 * Rules:
 *  1. The cell must be a valid date
 *  2. Critter must not already have a mortality (only one allowed)
 *
 * @param {Map<string, ICritterDetailed>} surveyAliasMap The survey alias map
 * @param {CSVConfigUtils<MortalityCSVStaticHeader>} utils The CSV config utils
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getMortalityDateCellValidator = (
  surveyAliasMap: Map<string, ICritterDetailed>,
  utils: CSVConfigUtils<MortalityCSVStaticHeader>
): CSVCellValidator => {
  return (params) => {
    const cellErrors = validateZodCell(params.cell, z.string().date());
    if (cellErrors.length) {
      return cellErrors;
    }
    const critterAlias = String(utils.getCellValue('ALIAS', params.row));
    const critter = surveyAliasMap.get(critterAlias.toLowerCase());
    // Only allow one mortality per critter
    if (critter?.mortality && (Array.isArray(critter.mortality) ? critter.mortality.length > 0 : true)) {
      return [
        {
          error: `Mortality already exists for critter. Only one mortality event is allowed per animal.`,
          solution: `Remove alternate mortality event for this animal.`
        }
      ];
    }
    return [];
  };
};

/**
 * Get the mortality date cell validator.
 *
 * Rules:
 *  1. The cell must be a valid date
 *  2. Critter must not already have a mortality (only one allowed)
 *
 * @param {Map<string, ICritterDetailed>} surveyAliasMap The survey alias map
 * @param {CSVConfigUtils<MortalityCSVStaticHeader>} utils The CSV config utils
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getMortalityCauseCellValidator = (
  surveyAliasMap: Map<string, ICritterDetailed>,
  utils: CSVConfigUtils<MortalityCSVStaticHeader>
): CSVCellValidator => {
  return (params) => {
    const cellErrors = validateZodCell(params.cell, z.string().date());
    if (cellErrors.length) {
      return cellErrors;
    }
    const critterAlias = String(utils.getCellValue('ALIAS', params.row));
    const critter = surveyAliasMap.get(critterAlias.toLowerCase());
    // Only allow one mortality per critter
    if (critter?.mortality && (Array.isArray(critter.mortality) ? critter.mortality.length > 0 : true)) {
      return [
        {
          error: `Mortality already exists for critter. Only one mortality event is allowed per animal.`,
          solution: `Remove alternate mortality event for this animal.`
        }
      ];
    }
    return [];
  };
};

/**
 * Get a validator for mortality cause that checks if the value exists in the allowed cause of death names/types.
 *
 * @param {Set<string>} allowedCauses - Lowercased set of allowed cause of death names/types
 * @returns {CSVCellValidator}
 */
export const getMortalityCauseNameCellValidator = (allowedCauses: Set<string>): CSVCellValidator => {
  return (params) => {
    const value = String(params.cell).trim().toLowerCase();
    if (!value || !allowedCauses.has(value)) {
      return [
        {
          error: `Invalid cause of death: '${params.cell}'. Must match a valid cause of death in SIMS.`,
          solution: 'Check spelling or use a valid cause of death.'
        }
      ];
    }
    return [];
  };
};
