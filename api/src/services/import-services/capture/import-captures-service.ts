import { v4 as uuid } from 'uuid';
import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDateCellValidator,
  getDescriptionCellValidator,
  getLatitudeCellValidator,
  getLongitudeCellValidator,
  getTimeCellValidator
} from '../../../utils/csv-utils/csv-header-configs';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';

const defaultLog = getLogger('services/import/import-captures-service');

const CAPTURE_LONGITUDE_ALIASES: Uppercase<string>[] = [
  'CAPTURE LONGITUDE',
  'CAPTURE_LONG',
  'CAPTURE LONG',
  'CAPTURE_LON',
  'CAPTURE LON',
  'CAPTURE_LNG',
  'CAPTURE LNG'
];

const RELEASE_LONGITUDE_ALIASES: Uppercase<string>[] = [
  'RELEASE LONGITUDE',
  'RELEASE_LONG',
  'RELEASE LONG',
  'RELEASE_LON',
  'RELEASE LON',
  'RELEASE_LNG',
  'RELEASE LNG'
];

// Capture CSV static headers
export type CaptureCSVStaticHeader =
  | 'ALIAS'
  | 'CAPTURE_DATE'
  | 'CAPTURE_TIME'
  | 'CAPTURE_LATITUDE'
  | 'CAPTURE_LONGITUDE'
  | 'RELEASE_DATE'
  | 'RELEASE_TIME'
  | 'RELEASE_LATITUDE'
  | 'RELEASE_LONGITUDE'
  | 'CAPTURE_COMMENT'
  | 'RELEASE_COMMENT';

/**
 * ImportCapturesService - A service for importing Captures from a CSV into Critterbase.
 *
 * @class ImportCapturesService
 * @extends DBService
 */
export class ImportCapturesService extends DBService {
  worksheet: WorkSheet;
  surveyId: number;

  surveyCritterService: SurveyCritterService;
  utils: CSVConfigUtils<CaptureCSVStaticHeader>;

  /**
   * Construct an instance of ImportCapturesService.
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} surveyId
   */
  constructor(connection: IDBConnection, worksheet: WorkSheet, surveyId: number) {
    super(connection);

    const initialConfig: CSVConfig<CaptureCSVStaticHeader> = {
      staticHeadersConfig: {
        ALIAS: { aliases: ['NICKNAME', 'ANIMAL'] },
        CAPTURE_DATE: { aliases: ['CAPTURE_DATE'] },
        CAPTURE_TIME: { aliases: ['CAPTURE_TIME'], optional: true },
        CAPTURE_LATITUDE: { aliases: ['CAPTURE LATITUDE', 'CAPTURE_LAT', 'CAPTURE LAT'] },
        CAPTURE_LONGITUDE: { aliases: CAPTURE_LONGITUDE_ALIASES },
        RELEASE_DATE: { aliases: ['RELEASE DATE'], optional: true },
        RELEASE_TIME: { aliases: ['RELEASE TIME'], optional: true },
        RELEASE_LATITUDE: { aliases: ['RELEASE LATITUDE', 'RELEASE_LAT', 'RELEASE LAT'], optional: true },
        RELEASE_LONGITUDE: { aliases: RELEASE_LONGITUDE_ALIASES, optional: true },
        CAPTURE_COMMENT: { aliases: ['CAPTURE COMMENT', 'CAPTURE_NOTES', 'CAPTURE NOTES'], optional: true },
        RELEASE_COMMENT: { aliases: ['RELEASE COMMENT', 'RELEASE_NOTES', 'RELEASE NOTES'], optional: true }
      },
      ignoreDynamicHeaders: false
    };

    this.worksheet = worksheet;
    this.surveyId = surveyId;

    this.surveyCritterService = new SurveyCritterService(connection);
    this.utils = new CSVConfigUtils(this.worksheet, initialConfig);
  }

  /**
   * Import a Capture CSV worksheet into Critterbase.
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

    const captures = rows.map((row) => {
      return {
        capture_id: row['capture_id'],
        critter_id: row['critter_id'],
        capture_location_id: uuid(),
        capture_date: row.CAPTURE_DATE,
        capture_time: row.CAPTURE_TIME,
        capture_latitude: row.CAPTURE_LATITUDE,
        capture_longitude: row.CAPTURE_LONGITUDE,
        capture_comment: row.CAPTURE_COMMENT,
        release_location_id: row.RELEASE_LATITUDE && row.RELEASE_LONGITUDE ? uuid() : undefined,
        release_date: row.RELEASE_DATE,
        release_time: row.RELEASE_TIME,
        release_latitude: row.RELEASE_LATITUDE,
        release_longitude: row.RELEASE_LONGITUDE,
        release_comment: row.RELEASE_COMMENT
      };
    });

    defaultLog.debug({ label: 'import captures', captures });

    await this.surveyCritterService.critterbaseService.bulkCreate({ captures });

    return [];
  }

  /**
   * Get the CSV configuration for Captures.
   *
   * @returns {Promise<CSVConfig<CaptureCSVStaticHeader>>} The CSV configuration
   */
  async getCSVConfig(): Promise<CSVConfig<CaptureCSVStaticHeader>> {
    this.utils.setStaticHeaderConfig('ALIAS', { validateCell: undefined });
    this.utils.setStaticHeaderConfig('CAPTURE_DATE', { validateCell: getDateCellValidator() });
    this.utils.setStaticHeaderConfig('CAPTURE_TIME', { validateCell: getTimeCellValidator() });
    this.utils.setStaticHeaderConfig('CAPTURE_LATITUDE', { validateCell: getLatitudeCellValidator() });
    this.utils.setStaticHeaderConfig('CAPTURE_LONGITUDE', { validateCell: getLongitudeCellValidator() });
    this.utils.setStaticHeaderConfig('RELEASE_DATE', { validateCell: getDateCellValidator({ optional: true }) });
    this.utils.setStaticHeaderConfig('RELEASE_TIME', { validateCell: getTimeCellValidator() });
    this.utils.setStaticHeaderConfig('RELEASE_LATITUDE', {
      validateCell: getLatitudeCellValidator({ optional: true })
    });
    this.utils.setStaticHeaderConfig('RELEASE_LONGITUDE', {
      validateCell: getLongitudeCellValidator({ optional: true })
    });
    this.utils.setStaticHeaderConfig('CAPTURE_COMMENT', { validateCell: getDescriptionCellValidator() });
    this.utils.setStaticHeaderConfig('RELEASE_COMMENT', { validateCell: getDescriptionCellValidator() });

    // Return the final CSV config
    return this.utils.getConfig();
  }
}
