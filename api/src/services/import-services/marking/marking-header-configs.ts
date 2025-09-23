import { z } from 'zod';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVCellValidator, CSVError, CSVParams } from '../../../utils/csv-utils/csv-config-validation.interface';
import { validateZodCell } from '../../../utils/csv-utils/csv-header-configs';
import { NestedRecord } from '../../../utils/nested-record';
import { setToLowercase } from '../../../utils/string-utils';
import { ICritterDetailed } from '../../critterbase-service';
import { findCapturesFromDateTime } from '../utils/datetime';
import { MarkingCSVStaticHeader } from './import-markings-service';

/**
 * Get the marking identifier cell validator.
 *
 * Rules:
 *  1. The cell can be a string with a length between 1 and 50
 *  2. The cell can be a number with a min value of 0
 *  3. The cell can be optional
 *
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getMarkingIdentifierCellValidator = (): CSVCellValidator => {
  return (params: CSVParams) => {
    return validateZodCell(params.cell, z.union([z.string().trim().min(1).max(50), z.number().min(0)]).optional());
  };
};

/**
 * Get the marking alias cell validator.
 *
 * Note: Modifies the mutateCell value to the `critter_id`
 *
 * Rules:
 *  1. The alias must exist in the surveyAliasMap ie: critter alias -> critter
 *  2. The alias (critter) must have Critterbase captures
 *
 * @param {Map<string, ICritterDetailed>} surveyAliasMap The survey alias map
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getMarkingAliasCellValidator = (surveyAliasMap: Map<string, ICritterDetailed>): CSVCellValidator => {
  return (params: CSVParams) => {
    if (params.cell === undefined) {
      return [];
    }

    const critter = surveyAliasMap.get(String(params.cell).toLowerCase());

    if (!critter) {
      return [
        {
          error: `Unable to find a matching survey critter`,
          solution: `Use a valid critter alias that exists in the Survey`
        }
      ];
    }

    // If the critter has no captures
    if (critter.captures.length === 0) {
      return [
        {
          error: `Animal has no captures`,
          solution: `Add captures to animal`
        }
      ];
    }

    // Set the critter id in the state for the setter
    params.mutateCell = critter.critter_id;

    return [];
  };
};

/**
 * Get the marking type cell validator.
 *
 * Rules:
 *  1. The cell must be a valid marking type ie: exists in the markingTypes set
 *
 * @param {Set<string>} markingTypes The marking types set (case insensitive)
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getMarkingTypeCellValidator = (markingTypes: Set<string>): CSVCellValidator => {
  const markingTypesLowerCased = setToLowercase(markingTypes);

  return (params: CSVParams) => {
    if (params.cell === undefined) {
      return [];
    }

    if (!markingTypesLowerCased.has(String(params.cell).toLowerCase())) {
      return [
        {
          error: `Marking type not supported`,
          solution: `Use a valid marking type`,
          values: Array.from(markingTypes)
        }
      ];
    }

    return [];
  };
};

/**
 * Get the marking type cell setter.
 *
 * @param {Set<string>} colours The colours set (case insensitive)
 * @returns {*} {CSVCellSetter} The set cell callback
 */
export const getMarkingColourCellValidator = (colours: Set<string>): CSVCellValidator => {
  const coloursLowerCased = setToLowercase(colours);

  return (params: CSVParams) => {
    if (params.cell === undefined) {
      return [];
    }

    if (coloursLowerCased.has(String(params.cell).toLowerCase())) {
      return [];
    }

    return [{ error: `Colour not supported`, solution: `Use a valid colour`, values: Array.from(colours) }];
  };
};

/**
 * Get the marking body location cell validator.
 *
 * Rules:
 *  1. The cell must be a valid body location for the critter ie: exists in the rowDictionary
 *
 * @param {Map<string, ICritterDetailed>} surveyAliasMap The survey alias map
 * @param {NestedRecord<string>} rowDictionary The row dictionary
 * @param {CSVConfigUtils<MarkingCSVStaticHeader>} utils The CSV config utils
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getMarkingBodyLocationCellValidator = (
  surveyAliasMap: Map<string, ICritterDetailed>,
  rowDictionary: NestedRecord<string>,
  utils: CSVConfigUtils<MarkingCSVStaticHeader>
): CSVCellValidator => {
  return (params: CSVParams) => {
    const rowAlias = String(utils.getCellValue('ALIAS', params.row));
    const aliasTsn = surveyAliasMap.get(rowAlias.toLowerCase())?.itis_tsn;

    // ALIAS header will catch this error
    if (!aliasTsn) {
      return [];
    }

    const rowDictionaryAlias = rowDictionary.get(aliasTsn);

    if (!rowDictionaryAlias) {
      return [
        {
          error: `Taxon marking body locations not found for animal`,
          solution: `Validate the taxon (TSN) is correct and it allows marking body locations`
        }
      ];
    }

    const bodyLocationCellValue = String(params.cell);

    const rowDictionaryBodyLocation = rowDictionary.get(aliasTsn, bodyLocationCellValue);

    if (!rowDictionaryBodyLocation) {
      return [
        {
          error: `Invalid taxon marking body location`,
          solution: `Use valid taxon marking body location`,
          values: Object.keys(rowDictionaryAlias)
        }
      ];
    }

    return [];
  };
};

/**
 * Get the marking capture date cell validator.
 *
 * Note: Modifies the mutateCell value to the `capture_id`
 *
 * Rules:
 *  1. The cell combined with the 'CAPTURE_TIME' must be a valid timestamp
 *  2. The timestamp must map to a specific critter capture
 *
 * @param {Map<string, ICritterDetailed>} surveyAliasMap The survey alias map
 * @param {CSVConfigUtils<MarkingCSVStaticHeader>} utils The CSV config utils
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getMarkingCaptureDateCellValidator = (
  surveyAliasMap: Map<string, ICritterDetailed>,
  utils: CSVConfigUtils<MarkingCSVStaticHeader>
): CSVCellValidator => {
  return (params: CSVParams): CSVError[] => {
    const cellErrors = validateZodCell(params.cell, z.string().date());

    if (cellErrors.length) {
      return cellErrors;
    }

    // Row meta data
    const dateCellValue = String(params.cell);
    const rowAlias = String(utils.getCellValue('ALIAS', params.row));
    const rowTime = utils.getCellValue('CAPTURE_TIME', params.row) as string; // casting to allow undefined
    const aliasCritter = surveyAliasMap.get(rowAlias.toLowerCase());

    // All alias errors need to be resolved before proceeding ie: alias not found
    if (!aliasCritter) {
      return [];
    }

    const foundCaptures = findCapturesFromDateTime(aliasCritter.captures, dateCellValue, rowTime);

    // If unable to map the capture date and time to a specific critter capture
    if (foundCaptures.length === 0) {
      return [
        {
          error: `Capture not found for animal using date AND time`,
          solution: `Use a valid date and time to identify the capture`
        }
      ];
    }

    // If multiple captures found for the critter - data error
    if (foundCaptures.length > 1) {
      return [
        { error: `Multiple captures found for animal`, solution: `Use a unique date and time to identify the capture` }
      ];
    }

    // Set the capture id in the state for the setter
    params.mutateCell = foundCaptures[0].capture_id;

    return [];
  };
};
