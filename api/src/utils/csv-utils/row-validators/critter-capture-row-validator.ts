import { ICritterDetailed } from '../../../services/critterbase-service';
import { findCapturesFromDateTime } from '../../../services/import-services/utils/datetime';
import { CSVConfigUtils } from '../csv-config-utils';
import { CSVRowValidator } from '../csv-config-validation.interface';
import { updateCSVRowState } from '../csv-header-configs';

type StaticHeaderNames = {
  alias: Uppercase<string>;
  captureDate: Uppercase<string>;
  captureTime: Uppercase<string>;
};

const DEFAULT_HEADERS: StaticHeaderNames = {
  alias: 'ALIAS',
  captureDate: 'CAPTURE_DATE',
  captureTime: 'CAPTURE_TIME'
};

/**
 * Get the critter capture row validator. Validates the critter alias, capture date, and capture time.
 *
 * Note: This will update the row state with the critter_id and capture_id.
 *
 * Rules:
 *  1. The alias must exist in the survey alias map
 *  2. The critter must have at least one capture
 *  3. The capture date and time must map to a specific critter capture
 *
 * @param {Map<string, ICritterDetailed>} surveyAliasMap The survey alias map
 * @param {CSVConfigUtils} utils The CSV config utils
 * @returns {*} {CSVRowValidator} The validate row callback
 */
export const getCritterCaptureRowValidator = (
  surveyAliasMap: Map<string, ICritterDetailed>,
  utils: CSVConfigUtils,
  headers: StaticHeaderNames = DEFAULT_HEADERS
): CSVRowValidator => {
  return (params) => {
    const alias = String(utils.getCellValue(headers.alias, params.row));
    const critter = surveyAliasMap.get(alias.toLowerCase());

    // If the alias is not found in the survey alias map ie: critter does not exist in the survey with this alias
    if (!critter) {
      return [
        {
          error: `Unable to find a matching survey animal`,
          solution: `Use a valid critter alias that exists in the survey`,
          header: utils.getWorksheetHeader(headers.alias, params.row),
          cell: alias
        }
      ];
    }

    // If the critter has no captures
    if (critter.captures.length === 0) {
      return [
        {
          error: `Animal has no captures`,
          solution: `Add captures to animal`,
          header: utils.getWorksheetHeader(headers.alias, params.row),
          cell: alias
        }
      ];
    }

    const captureDate = String(utils.getCellValue(headers.captureDate, params.row));
    const captureTime = utils.getCellValue(headers.captureTime, params.row);
    const captureTimeStr = captureTime ? String(captureTime) : undefined;

    const foundCaptures = findCapturesFromDateTime(critter.captures, captureDate, captureTimeStr);

    // If unable to map the capture date and time to a specific critter capture
    if (foundCaptures.length === 0) {
      // Returning both errors for date and time
      return [
        {
          error: `Capture not found for animal using date`,
          solution: `Use a valid date to identify the capture`,
          header: utils.getWorksheetHeader(headers.captureDate, params.row),
          cell: captureDate
        },
        {
          error: `Capture not found for animal using date and time`,
          solution: `Use a valid date and time to identify the capture`,
          header: utils.getWorksheetHeader(headers.captureTime, params.row),
          cell: captureTime
        }
      ];
    }

    // If multiple captures found for the critter - data error
    if (foundCaptures.length > 1) {
      return [
        {
          error: `Multiple captures found for animal`,
          solution: `Use a unique date and time to identify the capture`,
          header: utils.getWorksheetHeader(headers.captureDate, params.row),
          cell: captureDate
        }
      ];
    }

    // Update the row state with the critter and capture id
    updateCSVRowState(params.row, {
      critter_id: critter.critter_id,
      capture_id: critter.captures[0].capture_id
    });

    return [];
  };
};
