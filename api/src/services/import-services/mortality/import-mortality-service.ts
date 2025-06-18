import { v4 as uuid } from 'uuid';
import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import {
  CSVConfig,
  CSVError,
  CSVRowState,
  CSVRowValidated
} from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDateCellValidator,
  getDescriptionCellValidator,
  getLatitudeCellValidator,
  getLongitudeCellValidator,
  getSurveyCritterAliasCellValidator,
  getTimeCellSetter,
  getTimeCellValidator
} from '../../../utils/csv-utils/csv-header-configs';
import { getLogger } from '../../../utils/logger';
import { ILocation, IMortality } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';

const defaultLog = getLogger('services/import/import-mortalities-service');

const MORTALITY_LONGITUDE_ALIASES: Uppercase<string>[] = [
  'MORTALITY LONGITUDE',
  'MORTALITY_LONG',
  'MORTALITY LONG',
  'MORTALITY_LON',
  'MORTALITY LON',
  'MORTALITY_LNG',
  'MORTALITY LNG'
];

// Mortality CSV static headers
export type MortalityCSVStaticHeader =
  | 'ALIAS'
  | 'MORTALITY_DATE'
  | 'MORTALITY_TIME'
  | 'CAUSE_OF_DEATH'
  | 'MORTALITY_LATITUDE'
  | 'MORTALITY_LONGITUDE'
  | 'MORTALITY_COMMENT';

/**
 * ImportMortalitiesService - A service for importing Mortalities from a CSV into Critterbase.
 *
 * @class ImportMortalitiesService
 * @extends DBService
 */
export class ImportMortalitiesService extends DBService {
  worksheet: WorkSheet;
  surveyId: number;

  surveyCritterService: SurveyCritterService;
  utils: CSVConfigUtils<MortalityCSVStaticHeader>;

  private _causeOfDeathMap?: Map<string, string>;

  /**
   * Construct an instance of ImportMortalitiesService.
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} surveyId
   */
  constructor(connection: IDBConnection, worksheet: WorkSheet, surveyId: number) {
    super(connection);

    const initialConfig: CSVConfig<MortalityCSVStaticHeader> = {
      staticHeadersConfig: {
        ALIAS: { aliases: ['NICKNAME', 'ANIMAL', 'ANIMAL ID', 'ANIMAL_ID'] },
        MORTALITY_DATE: { aliases: ['MORTALITY DATE', 'DATE'] },
        MORTALITY_TIME: { aliases: ['MORTALITY TIME', 'TIME'], optional: true },
        CAUSE_OF_DEATH: { aliases: ['CAUSE OF DEATH', 'COD', 'C.O.D.'] },
        MORTALITY_LATITUDE: { aliases: ['MORTALITY LATITUDE', 'MORTALITY_LAT', 'MORTALITY LAT'] },
        MORTALITY_LONGITUDE: { aliases: MORTALITY_LONGITUDE_ALIASES },
        MORTALITY_COMMENT: { aliases: ['MORTALITY COMMENT', 'MORTALITY_NOTES', 'MORTALITY NOTES'], optional: true }
      },
      ignoreDynamicHeaders: false
    };

    this.worksheet = worksheet;
    this.surveyId = surveyId;

    this.surveyCritterService = new SurveyCritterService(connection);
    this.utils = new CSVConfigUtils(this.worksheet, initialConfig);
  }

  /**
   * Fetch and cache cause of death options from Critterbase.
   * Returns a map of lowercased label/value to ID.
   */
  async getCauseOfDeathMap(): Promise<Map<string, string>> {
    if (this._causeOfDeathMap) {
      return this._causeOfDeathMap;
    }
    // Fetch from Critterbase lookups/cods?format=asSelect
    const codOptions = await this.surveyCritterService.critterbaseService.axiosInstance.get('/lookups/cods', {
      params: { format: 'asSelect' }
    });
    // Map both value and label (lowercased) to id
    const map = new Map<string, string>();
    for (const opt of codOptions.data) {
      if (opt.value) map.set(String(opt.value).toLowerCase(), opt.id);
      if (opt.label) map.set(String(opt.label).toLowerCase(), opt.id);
    }
    this._causeOfDeathMap = map;
    return map;
  }

  /**
   * Import a Mortality CSV worksheet into Critterbase.
   *
   * @async
   * @throws {ApiGeneralError} - If unable to fully insert records into Critterbase
   * @returns {*} {Promise<CSVError[]>} List of CSV errors encountered during import
   */
  async importCSVWorksheet(): Promise<CSVError[]> {
    const config = await this.getCSVConfig();
    const { errors, rows } = validateCSVWorksheet(this.worksheet, config);
    if (errors.length) {
      return errors;
    }
    const causeOfDeathMap = await this.getCauseOfDeathMap();
    const mortalities: IMortality[] = [];
    const locations: ILocation[] = [];
    const rowErrors: CSVError[] = [];
    for (const [i, row] of rows.entries()) {
      // Map cause of death name to ID
      const codName = String(row.CAUSE_OF_DEATH || '').toLowerCase();
      const codId = causeOfDeathMap.get(codName);
      if (!codId) {
        rowErrors.push({
          error: `Row ${i + 2}: Unknown cause of death '${row.CAUSE_OF_DEATH}'. Must match a valid Critterbase cause of death option.`,
          solution: 'Check spelling/capitalization or use a valid cause of death name/ID.'
        });
        continue;
      }
      const { mortality, mortalityLocation } = this._convertRowIntoPayloads(row, codId);
      mortalities.push(mortality);
      locations.push(mortalityLocation);
    }
    if (rowErrors.length) {
      return rowErrors;
    }
    defaultLog.debug({ label: 'import mortalities', mortalities });
    await this.surveyCritterService.critterbaseService.bulkCreate({ mortalities, locations });
    return [];
  }

  /**
   * Get the CSV configuration for Mortalities.
   *
   * @returns {Promise<CSVConfig<MortalityCSVStaticHeader>>} The CSV configuration
   */
  async getCSVConfig(): Promise<CSVConfig<MortalityCSVStaticHeader>> {
    const surveyAliasMap = await this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId);
    // Fetch cause of death options from Critterbase and build a set of allowed names/types
    this.utils.setAllStaticHeaderConfigs({
      ALIAS: { validateCell: getSurveyCritterAliasCellValidator(surveyAliasMap) },
      MORTALITY_DATE: { validateCell: getDateCellValidator() },
      MORTALITY_TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() },
      CAUSE_OF_DEATH: { validateCell: getDescriptionCellValidator() },
      MORTALITY_LATITUDE: { validateCell: getLatitudeCellValidator() },
      MORTALITY_LONGITUDE: { validateCell: getLongitudeCellValidator() },
      MORTALITY_COMMENT: { validateCell: getDescriptionCellValidator({ optional: true }) }
    });

    // Return the final CSV config
    return this.utils.getConfig();
  }

  /**
   * Convert a CSV row into Critterbase Mortality and Location payloads.
   * Accepts a cause of death ID.
   */
  _convertRowIntoPayloads(row: CSVRowValidated<MortalityCSVStaticHeader>, causeOfDeathId: string) {
    const mortalityLocation: ILocation = {
      location_id: uuid(),
      latitude: row.MORTALITY_LATITUDE,
      longitude: row.MORTALITY_LONGITUDE
    };

    const mortality: IMortality = {
      mortality_id: uuid(),
      critter_id: row[CSVRowState]?.critterId,
      location_id: mortalityLocation.location_id as string,
      mortality_timestamp: `${row.MORTALITY_DATE}${row.MORTALITY_TIME ? 'T' + row.MORTALITY_TIME : ''}`,
      proximate_cause_of_death_id: causeOfDeathId,
      proximate_cause_of_death_confidence: '', // Set as needed
      proximate_predated_by_itis_tsn: '', // Set as needed
      ultimate_cause_of_death_id: '', // Set as needed
      ultimate_cause_of_death_confidence: '', // Set as needed
      ultimate_predated_by_itis_tsn: '', // Set as needed
      mortality_comment: row.MORTALITY_COMMENT,
      mortality_location: {
        latitude: row.MORTALITY_LATITUDE,
        longitude: row.MORTALITY_LONGITUDE
      }
    };

    return { mortality, mortalityLocation };
  }
}
