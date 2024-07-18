import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { CSV_COLUMN_ALIASES } from '../../../utils/xlsx-utils/column-aliases';
import { generateCellGetterFromColumnValidator } from '../../../utils/xlsx-utils/column-validator-utils';
import { IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import { CritterbaseService, IBulkCreate } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { CSVImportService, Row } from '../csv-import-strategy.interface';
import { CsvCapture, CsvCaptureSchema, PartialCsvCapture } from './import-captures-service.interface';

/**
 *
 * @class ImportCapturesService
 * @extends DBService
 *
 */
export class ImportCapturesService extends DBService implements CSVImportService<CsvCapture, PartialCsvCapture> {
  /**
   * Critterbase service
   */
  critterbaseService: CritterbaseService;
  /**
   * Critterbase critter id (uuid)
   *
   * Provided if attempting to bulk import Captures for a known Critter.
   */
  critterbaseCritterId?: string;

  /**
   * An XLSX validation config for the standard columns of a Capture CSV.
   *
   * Note: `satisfies` allows `keyof` to correctly infer key types, while also
   * enforcing uppercase object keys.
   */
  columnValidator = {
    ALIAS: { type: 'string', aliases: CSV_COLUMN_ALIASES.ALIAS },
    CAPTURE_DATE: { type: 'date' },
    CAPTURE_TIME: { type: 'string' },
    CAPTURE_LATITUDE: { type: 'number' },
    CAPTURE_LONGITUDE: { type: 'number' },
    RELEASE_DATE: { type: 'date' },
    RELEASE_TIME: { type: 'string' },
    RELEASE_LATITUDE: { type: 'number' },
    RELEASE_LONGITUDE: { type: 'number' },
    CAPTURE_COMMENT: { type: 'string' },
    RELEASE_COMMENT: { type: 'string' }
  } satisfies IXLSXCSVValidator;

  /**
   * Construct an instance of ImportCapturesService
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} [critterbaseCritterId] - Critterbse critter ID if importing Captures for specific Critter
   */
  constructor(connection: IDBConnection, critterbaseCritterId?: string) {
    super(connection);

    this.critterbaseCritterId = critterbaseCritterId;

    this.critterbaseService = new CritterbaseService({
      keycloak_guid: connection.systemUserGUID(),
      username: connection.systemUserIdentifier()
    });
  }

  /**
   * Get the critter ID from row or dependency.
   *
   * @param {Row} row - CSV row
   * @returns {string} Critterbase critter Identifier
   */
  getCritterIdFromRow(row: Row): string {
    if (this.critterbaseCritterId) {
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
    const getCellValue = generateCellGetterFromColumnValidator(this.columnValidator);

    return rows.map((row) => {
      return {
        critter_id: this.getCritterIdFromRow(row), // only property we know will be defined
        capture_location_id: uuid(),
        capture_date: getCellValue(row, 'CAPTURE_DATE'),
        capture_time: getCellValue(row, 'CAPTURE_TIME'),
        capture_latitude: getCellValue(row, 'CAPTURE_LATITUDE'),
        capture_longitude: getCellValue(row, 'CAPTURE_LONGITUDE'),
        release_date: getCellValue(row, 'RELEASE_DATE'),
        release_time: getCellValue(row, 'RELEASE_TIME'),
        release_latitude: getCellValue(row, 'RELEASE_LATITUDE'),
        release_longitude: getCellValue(row, 'RELEASE_LONGITUDE'),
        capture_comment: getCellValue(row, 'CAPTURE_COMMENT'),
        release_comment: getCellValue(row, 'RELEASE_COMMENT')
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
