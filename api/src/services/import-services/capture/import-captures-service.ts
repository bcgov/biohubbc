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
import { ICapture, ILocation } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { getCaptureDateCellValidator } from './capture-header-configs';

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
        CAPTURE_DATE: { aliases: ['CAPTURE DATE'] },
        CAPTURE_TIME: { aliases: ['CAPTURE TIME'], optional: true },
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

    const captures: ICapture[] = [];
    const locations: ILocation[] = [];

    for (const row of rows) {
      const { capture, captureLocation, releaseLocation } = this._convertRowIntoPayloads(row);

      // Push the capture and location data
      captures.push(capture);
      locations.push(captureLocation);
      if (releaseLocation) {
        locations.push(releaseLocation);
      }
    }

    defaultLog.debug({ label: 'import captures', captures });

    await this.surveyCritterService.critterbaseService.bulkCreate({ captures, locations });

    return [];
  }

  /**
   * Get the CSV configuration for Captures.
   *
   * @returns {Promise<CSVConfig<CaptureCSVStaticHeader>>} The CSV configuration
   */
  async getCSVConfig(): Promise<CSVConfig<CaptureCSVStaticHeader>> {
    const surveyAliasMap = await this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId);

    this.utils.setAllStaticHeaderConfigs({
      ALIAS: { validateCell: getSurveyCritterAliasCellValidator(surveyAliasMap) },
      CAPTURE_DATE: { validateCell: getCaptureDateCellValidator(surveyAliasMap, this.utils) },
      CAPTURE_TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() },
      CAPTURE_LATITUDE: { validateCell: getLatitudeCellValidator() },
      CAPTURE_LONGITUDE: { validateCell: getLongitudeCellValidator() },
      CAPTURE_COMMENT: { validateCell: getDescriptionCellValidator({ optional: true }) },
      RELEASE_DATE: { validateCell: getDateCellValidator({ optional: true }) },
      RELEASE_TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() },
      RELEASE_LATITUDE: { validateCell: getLatitudeCellValidator({ optional: true }) },
      RELEASE_LONGITUDE: { validateCell: getLongitudeCellValidator({ optional: true }) },
      RELEASE_COMMENT: { validateCell: getDescriptionCellValidator({ optional: true }) }
    });

    // Return the final CSV config
    return this.utils.getConfig();
  }

  /**
   * Convert a CSV row into Critterbase Capture and Location payloads.
   *
   * @param {CSVRowValidated<CaptureCSVStaticHeader>} row - The validated CSV row
   * @returns {*}
   */
  _convertRowIntoPayloads(row: CSVRowValidated<CaptureCSVStaticHeader>) {
    let releaseLocation: ILocation | undefined;
    const captureLocation: ILocation = {
      location_id: uuid(),
      latitude: row.CAPTURE_LATITUDE,
      longitude: row.CAPTURE_LONGITUDE
    };

    if (row.RELEASE_LATITUDE && row.RELEASE_LONGITUDE) {
      releaseLocation = {
        location_id: uuid(),
        latitude: row.RELEASE_LATITUDE,
        longitude: row.RELEASE_LONGITUDE
      };
    }

    const capture: ICapture = {
      capture_id: uuid(),
      critter_id: row[CSVRowState]?.critterId,
      capture_date: row.CAPTURE_DATE,
      capture_time: row.CAPTURE_TIME,
      capture_location_id: captureLocation.location_id as string,
      capture_comment: row.CAPTURE_COMMENT,
      release_date: row.RELEASE_DATE,
      release_time: row.RELEASE_TIME,
      release_location_id: releaseLocation?.location_id,
      release_comment: row.RELEASE_COMMENT
    };

    return { capture, captureLocation, releaseLocation };
  }
}
