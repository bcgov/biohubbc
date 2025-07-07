import { ICritterDetailed } from '../../../services/critterbase-service';
import { updateCSVRowState } from '../../../services/import-services/utils/row-state';
import { CSVConfigUtils } from '../csv-config-utils';
import { CSVRowValidator } from '../csv-config-validation.interface';

type StaticHeaderNames = {
  alias: Uppercase<string>;
  mortalityDate: Uppercase<string>;
  mortalityTime: Uppercase<string>;
};

const DEFAULT_HEADERS: StaticHeaderNames = {
  alias: 'ALIAS',
  mortalityDate: 'MORTALITY_DATE',
  mortalityTime: 'MORTALITY_TIME'
};

/**
 * Get the critter mortality row validator. Validates the critter alias, mortality date, and mortality time.
 *
 * Note: This will update the row state with the critter_id and mortality_id.
 *
 * Rules:
 *  1. The alias must exist in the survey alias map
 *  2. The critter must have at least one mortality
 *  3. The mortality date and time must map to a specific critter mortality
 *
 * @param {Map<string, ICritterDetailed>} surveyAliasMap The survey alias map
 * @param {CSVConfigUtils} utils The CSV config utils
 * @returns {*} {CSVRowValidator} The validate row callback
 */
export const getCritterMortalityRowValidator = (
  surveyAliasMap: Map<string, ICritterDetailed>,
  utils: CSVConfigUtils,
  headers: StaticHeaderNames = DEFAULT_HEADERS
): CSVRowValidator => {
  return (params) => {
    const alias = String(utils.getCellValue(headers.alias, params.row));
    const critter = surveyAliasMap.get(alias.toLowerCase());

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

    if (!critter.mortality) {
      return [
        {
          error: `Animal has no mortalities`,
          solution: `Add a mortality event to animal`,
          header: utils.getWorksheetHeader(headers.alias, params.row),
          cell: alias
        }
      ];
    }

    // Match by date/time
    const rowDate = utils.getCellValue(headers.mortalityDate, params.row);
    const rowTime = utils.getCellValue(headers.mortalityTime, params.row);
    // Use the same formatting as in import-mortality-service.ts
    const dayjs = require('dayjs');
    const tz = require('dayjs/plugin/timezone');
    const utc = require('dayjs/plugin/utc');
    dayjs.extend(utc);
    dayjs.extend(tz);
    const { formatDateString, formatTimeString } = require('../../../utils/date-time-utils');
    const rowTimestamp = dayjs
      .tz(
        rowTime ? `${formatDateString(rowDate)} ${formatTimeString(rowTime)}` : formatDateString(rowDate),
        'America/Los_Angeles'
      )
      .format();

    // critter.mortality can be an array or single object, handle both
    const mortalities = Array.isArray(critter.mortality) ? critter.mortality : [critter.mortality];
    const matched = mortalities.find((m) => m.mortality_timestamp === rowTimestamp);
    if (!matched) {
      return [
        {
          error: `No mortality event found for critter on this date/time`,
          solution: `Check the mortality date/time for this animal`,
          header: utils.getWorksheetHeader(headers.mortalityDate, params.row),
          cell: rowDate
        }
      ];
    }
    updateCSVRowState(params.row, {
      critter_id: critter.critter_id,
      mortality_id: matched.mortality_id
    });
    return [];
  };
};
