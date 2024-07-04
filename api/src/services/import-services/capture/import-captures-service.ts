import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import {
  captureStandardColumnValidator,
  getCaptureDateFromRow,
  getCaptureLatitudeFromRow,
  getCaptureLongitudeFromRow,
  getCaptureTimeFromRow,
  getDescriptionFromRow,
  getReleaseDateFromRow,
  getReleaseLatitudeFromRow,
  getReleaseLongitudeFromRow,
  getReleaseTimeFromRow
} from '../../../utils/xlsx-utils/column-cell-utils';
import { IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import { CritterbaseService } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { CSVImportService, Row } from '../import-types';
import { CsvCapture, CsvCaptureSchema, PartialCsvCapture } from './import-captures-service.interface';

/**
 *
 * @class ImportCapturesService
 * @extends DBService
 *
 * TODO: Pass in the survey_id if needed by the importer / validator
 */
export class ImportCapturesService extends DBService implements CSVImportService<CsvCapture, PartialCsvCapture> {
  /**
   * Standard column validator
   */
  columnValidator: IXLSXCSVValidator;
  /**
   * Critterbase service
   */
  critterbaseService: CritterbaseService;
  /**
   * Critter ID is provided if attempting to bulk import Captures for a known Critter.
   * One (critter) -> Many (captures)
   */
  critterbaseCritterId?: string;

  /**
   * Construct an instance of ImportCapturesService
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} [critterbaseCritterId] - Critterbse critter ID if importing Captures for specific Critter
   */
  constructor(connection: IDBConnection, critterbaseCritterId?: string) {
    super(connection);

    this.columnValidator = captureStandardColumnValidator;

    this.critterbaseCritterId = critterbaseCritterId;

    this.critterbaseService = new CritterbaseService({
      keycloak_guid: connection.systemUserGUID(),
      username: connection.systemUserIdentifier()
    });
  }

  /**
   * Get the critter ID from row.
   *
   * @param {Row} row - CSV row
   * @returns {string} Critterbase critter Identifier
   */
  getCritterIdFromRow(row: Row): string {
    if (this.critterbaseCritterId) {
      // Bulk importing captures for a known critter
      return this.critterbaseCritterId;
    }
    // Attempt to retrieve the critter id with the alias and survey ID
    return `TEMP PLACEHOLDER FOR CRITTER ID RETRIEVAL ${row}`;
  }

  /**
   * Parse the CSV rows into the Critterbase capture format for validation.
   *
   * @param {Row[]} rows - CSV rows
   * @returns {PartialCsvCapture[]} CSV captures before validation
   */
  getRowsToValidate(rows: Row[]): PartialCsvCapture[] {
    return rows.map((row) => ({
      critter_id: this.getCritterIdFromRow(row), // only property we know will be defined
      capture_date: getCaptureDateFromRow(row),
      capture_time: getCaptureTimeFromRow(row),
      capture_latitude: getCaptureLatitudeFromRow(row),
      capture_longitude: getCaptureLongitudeFromRow(row),
      release_date: getReleaseDateFromRow(row),
      release_time: getReleaseTimeFromRow(row),
      release_latitude: getReleaseLatitudeFromRow(row),
      release_longitude: getReleaseLongitudeFromRow(row),
      capture_comment: getDescriptionFromRow(row)
    }));
  }

  /**
   * Validate the CSV rows against zod schema
   *
   * @param {PartialCsvCapture[]} rows - CSV rows
   * @returns {*}
   */
  async validateRows(rows: PartialCsvCapture[]) {
    return z.array(CsvCaptureSchema).safeParse(rows);
  }

  /**
   * Insert captures into Critterbase.
   *
   * @async
   * @param {CsvCapture[]} captures - List of CSV captures to create
   * @returns {Promise<ICapture[]>} List of created captures
   */
  async insert(captures: CsvCapture[]) {
    const createCapturePromises = captures.map((capture) => {
      const { capture_longitude, capture_latitude, release_latitude, release_longitude, ...payload } = capture;

      return this.critterbaseService.createCapture({
        ...payload,
        capture_location: {
          latitude: capture_latitude,
          longitude: capture_longitude
        },
        release_location: {
          latitude: release_latitude ?? capture_latitude,
          longitude: release_longitude ?? capture_longitude
        }
      });
    });

    return Promise.all(createCapturePromises);
  }
}
