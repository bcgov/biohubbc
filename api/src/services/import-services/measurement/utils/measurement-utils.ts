import { CSVConfigUtils } from '../../../../utils/csv-utils/csv-config-utils';
import { CSVParams } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { ICritterDetailed } from '../../../critterbase-service';

/**
 * Get the measurement row TSN getter - ie: Get the ITIS TSN from the row
 *
 * @param {Map<string, ICritterDetailed>} surveyAliasMap The survey alias map
 * @param {CSVConfigUtils} utils The CSV config utils
 * @returns {*} {(params: CSVParams) => number} The get measurement row TSN callback
 */
export const getMeasurementRowTSNGetter = (surveyAliasMap: Map<string, ICritterDetailed>, utils: CSVConfigUtils) => {
  return (params: CSVParams): number => {
    const alias = String(utils.getCellValue('ALIAS', params.row)).toLowerCase();
    const critter = surveyAliasMap.get(alias);
    return Number(critter?.itis_tsn);
  };
};
