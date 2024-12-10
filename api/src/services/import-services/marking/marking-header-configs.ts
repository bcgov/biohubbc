import { z } from 'zod';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVCellValidator, CSVError, CSVParams } from '../../../utils/csv-utils/csv-config-validation.interface';
import { validateZodCell } from '../../../utils/csv-utils/csv-header-configs';
import { NestedRecord } from '../../../utils/nested-record';
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
    return validateZodCell(params, z.union([z.string().trim().min(1).max(50), z.number().min(0)]).optional());
  };
};

/**
 * Get the marking alias cell validator.
 *
 * Note: Mutates the cell value to the `critter_id`
 *
 * Rules:
 *  1. The alias must exist in the surveyAliasMap ie: critter alias -> critter
 *
 *  @param {Map<string, ICritterDetailed>} surveyAliasMap The survey alias map
 *  @returns {*} {CSVCellValidator} The validate cell callback
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

    // Set the critter id in the state for the setter
    params.cell = critter.critter_id;
    return [];
  };
};

/**
 * Get the marking type cell validator.
 *
 * Rules:
 *  1. The cell must be a valid marking type ie: exists in the markingTypes set
 *
 * @param {Set<string>} markingTypes The marking types
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getMarkingTypeCellValidator = (markingTypes: Set<string>): CSVCellValidator => {
  return (params: CSVParams) => {
    if (params.cell === undefined) {
      return [];
    }

    if (!markingTypes.has(String(params.cell).toLowerCase())) {
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
 * @returns {*} {CSVCellSetter} The set cell callback
 */
export const getMarkingColourCellValidator = (colours: Set<string>): CSVCellValidator => {
  return (params: CSVParams) => {
    if (params.cell === undefined) {
      return [];
    }

    if (colours.has(String(params.cell).toLowerCase())) {
      return [];
    }

    return [{ error: `Colour not supported`, solution: `Use a valid colour`, values: Array.from(colours) }];
  };
};

/**
 * Get the marking body location cell validator.
 *
 * Note: Mutates the cell value to the `body_location_id`
 *
 * Rules:
 *  1. The cell must be a valid body location for the critter ie: exists in the rowDictionary
 *
 * @param {NestedRecord<string>} rowDictionary The row dictionary
 * @param {CSVConfigUtils<MarkingCSVStaticHeader>} utils The CSV config utils
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getMarkingBodyLocationCellValidator = (
  rowDictionary: NestedRecord<string>,
  utils: CSVConfigUtils<MarkingCSVStaticHeader>
): CSVCellValidator => {
  return (params: CSVParams) => {
    if (params.cell === undefined) {
      return [];
    }

    const bodyLocationCellValue = String(params.cell);
    const rowAlias = String(utils.getCellValue('ALIAS', params.row));

    const rowDictionaryAlias = rowDictionary.get(rowAlias);

    if (!rowDictionaryAlias) {
      return [
        {
          error: `Taxon body locations not found for alias: ${rowAlias}`,
          solution: `Validate the alias is correct and taxon has body locations`
        }
      ];
    }

    const rowDictionaryBodyLocation = rowDictionary.get(rowAlias, bodyLocationCellValue);

    if (!rowDictionaryBodyLocation) {
      return [
        {
          error: `Invalid taxon body location`,
          solution: `Use valid taxon body location`,
          values: Object.keys(rowDictionaryAlias)
        }
      ];
    }

    // Set the body location id in the state for the setter
    params.cell = rowDictionaryBodyLocation;

    return [];
  };
};

/**
 * Get the marking capture date cell validator.
 *
 * Note: Mutates the cell value to the `capture_id`
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
    const cellErrors = validateZodCell(params, z.date());

    if (cellErrors.length) {
      return cellErrors;
    }

    // Row meta data
    const dateCellValue = String(params.cell);
    const rowAlias = String(utils.getCellValue('ALIAS', params.row));
    const rowTime = String(utils.getCellValue('CAPTURE_TIME', params.row));
    const aliasCritter = surveyAliasMap.get(rowAlias.toLowerCase());

    // Alias cell validator should have already caught this
    if (!aliasCritter) {
      return [];
    }

    // If the critter has no captures
    if (aliasCritter.captures.length === 0) {
      return [{ error: `Animal has no captures`, solution: `Add captures to animal` }];
    }

    const foundCaptures = findCapturesFromDateTime(aliasCritter.captures, dateCellValue, rowTime);

    // If unable to map the capture date and time to a specific critter capture
    if (foundCaptures.length === 0) {
      return [{ error: `Capture not found for animal`, solution: `Use a valid date and time to identify the capture` }];
    }

    // If multiple captures found for the critter - data error
    if (foundCaptures.length > 1) {
      return [
        { error: `Multiple captures found for animal`, solution: `Use a unique date and time to identify the capture` }
      ];
    }

    // Set the capture id in the state for the setter
    params.cell = foundCaptures[0].capture_id;

    return [];
  };
};
