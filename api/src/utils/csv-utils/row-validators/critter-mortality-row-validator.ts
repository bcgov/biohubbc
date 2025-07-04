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

    // Optionally, match by date/time if needed
    updateCSVRowState(params.row, {
      critter_id: critter.critter_id,
      mortality_id: critter.mortality.mortality_id
    });
    return [];
  };
};
