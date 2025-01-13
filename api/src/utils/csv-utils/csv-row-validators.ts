import { ICritterDetailed } from '../../services/critterbase-service';
import { findCapturesFromDateTime } from '../../services/import-services/utils/datetime';
import { CSVConfigUtils } from './csv-config-utils';
import { CSVRowValidator } from './csv-config-validation.interface';
import { updateCSVRowState } from './csv-header-configs';

export const getCritterCaptureRowValidator = (
  surveyAliasMap: Map<string, ICritterDetailed>,
  utils: CSVConfigUtils,
  config: {
    aliasHeader: Uppercase<string>;
    captureDateHeader: Uppercase<string>;
    captureTimeHeader: Uppercase<string>;
  }
): CSVRowValidator => {
  return (params) => {
    const alias = utils.getCellValue(config.aliasHeader, params.row);
    const captureDate = utils.getCellValue(config.captureDateHeader, params.row);
    const captureTime = utils.getCellValue(config.captureTimeHeader, params.row);

    const critter = surveyAliasMap.get(String(alias).toLowerCase());

    if (!critter) {
      return [
        {
          error: `Unable to find a matching survey critter`,
          solution: `Use a valid critter alias that exists in the Survey`,
          header: utils.getWorksheetHeader(config.aliasHeader, params.row),
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
          header: utils.getWorksheetHeader(config.aliasHeader, params.row),
          cell: alias
        }
      ];
    }

    const foundCaptures = findCapturesFromDateTime(critter.captures, String(captureDate), String(captureTime));

    // If unable to map the capture date and time to a specific critter capture
    if (foundCaptures.length === 0) {
      return [
        {
          error: `Capture not found for animal using date AND time`,
          solution: `Use a valid date and time to identify the capture`,
          header: utils.getWorksheetHeader(config.captureDateHeader, params.row),
          cell: captureDate
        }
      ];
    }

    // If multiple captures found for the critter - data error
    if (foundCaptures.length > 1) {
      return [
        {
          error: `Multiple captures found for animal`,
          solution: `Use a unique date and time to identify the capture`,
          header: utils.getWorksheetHeader(config.captureDateHeader, params.row),
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
