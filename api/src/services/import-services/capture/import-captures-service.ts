import { v4 as uuid } from 'uuid';
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
import { CritterbaseService, IBulkCreate } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { CSVImportService, Row } from '../import-types';
import { CsvCapture, CsvCaptureSchema, PartialCsvCapture } from './import-captures-service.interface';

/**
 *
 * @class ImportCapturesService
 * @extends DBService
 *
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
   * Get the critter ID from row or class state.
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
    return rows.map((row) => {
      return {
        critter_id: this.getCritterIdFromRow(row), // only property we know will be defined
        capture_location_id: uuid(),
        capture_date: getCaptureDateFromRow(row),
        capture_time: getCaptureTimeFromRow(row),
        capture_latitude: getCaptureLatitudeFromRow(row),
        capture_longitude: getCaptureLongitudeFromRow(row),
        release_date: getReleaseDateFromRow(row),
        release_time: getReleaseTimeFromRow(row),
        release_latitude: getReleaseLatitudeFromRow(row),
        release_longitude: getReleaseLongitudeFromRow(row),
        capture_comment: getDescriptionFromRow(row)
      };
    });
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
    const critterbasePayload: IBulkCreate = { captures: [], locations: [] };

    for (const row of captures) {
      // Generate static uuids for bulk create
      // Captures reference locations so we need to generate the uuid's before we create captures / locations
      const captureLocationUUID = uuid();
      const releaseLocationUUID = row.release_latitude && row.release_longitude ? uuid() : undefined;

      // Push the critter captures into payload
      critterbasePayload.captures?.push({
        critter_id: row.critter_id,
        capture_location_id: captureLocationUUID,
        release_location_id: releaseLocationUUID,
        capture_date: row.capture_date,
        capture_time: row.capture_time,
        release_date: row.release_date,
        release_time: row.release_time,
        capture_comment: row.capture_comment
      });

      // Push the critter capture locations into payload
      critterbasePayload.locations?.push({
        location_id: captureLocationUUID,
        latitude: row.capture_latitude,
        longitude: row.capture_longitude
      });

      // If release locatations included push into payload
      if (releaseLocationUUID) {
        critterbasePayload.locations?.push({
          location_id: releaseLocationUUID,
          // Lat / Lon are defined if releaseLocationUUID is defined
          latitude: row.release_latitude as number,
          longitude: row.release_longitude as number
        });
      }
    }

    return this.critterbaseService.bulkCreate(critterbasePayload);
  }
}
