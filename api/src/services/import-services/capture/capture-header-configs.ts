import { z } from 'zod';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVCellValidator } from '../../../utils/csv-utils/csv-config-validation.interface';
import { validateZodCell } from '../../../utils/csv-utils/csv-header-configs';
import { ICritterDetailed } from '../../critterbase-service';
import { findCapturesFromDateTime } from '../utils/datetime';
import { CaptureCSVStaticHeader } from './import-captures-service';

/**
 * Get the capture date cell validator.
 *
 * Rules:
 *  1. The cell combined with the 'CAPTURE_TIME' must be a valid timestamp
 *  2. The timestamp must NOT map to an existing capture for the critter
 *
 * @param {Map<string, ICritterDetailed>} surveyAliasMap The survey alias map
 * @param {CSVConfigUtils<MarkingCSVStaticHeader>} utils The CSV config utils
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getCaptureDateCellValidator = (
  surveyAliasMap: Map<string, ICritterDetailed>,
  utils: CSVConfigUtils<CaptureCSVStaticHeader>
): CSVCellValidator => {
  return (params) => {
    const cellErrors = validateZodCell(params.cell, z.string().date());

    if (cellErrors.length) {
      return cellErrors;
    }

    // Row meta data
    const captureDate = String(params.cell);
    const captureTime = utils.getCellValue('CAPTURE_TIME', params.row) as string | undefined;
    const critterAlias = String(utils.getCellValue('ALIAS', params.row));
    const critter = surveyAliasMap.get(critterAlias.toLowerCase());

    const foundCaptures = findCapturesFromDateTime(critter?.captures ?? [], captureDate, captureTime);

    if (foundCaptures.length > 0) {
      return [
        {
          error: `Capture already exists for critter on this date and time`,
          solution: `Use a unique date and time to identify the capture`
        }
      ];
    }

    return [];
  };
};
