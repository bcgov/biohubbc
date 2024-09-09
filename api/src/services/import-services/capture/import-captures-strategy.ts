import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { CSV_COLUMN_ALIASES } from '../../../utils/xlsx-utils/column-aliases';
import { generateColumnCellGetterFromColumnValidator } from '../../../utils/xlsx-utils/column-validator-utils';
import { IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import { ICapture, ILocation } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { CSVImportStrategy, Row } from '../import-csv.interface';
import { findCapturesFromDateTime, formatTimeString } from '../utils/datetime';
import { CsvCapture, CsvCaptureSchema } from './import-captures-strategy.interface';

/**
 *
 * @class ImportCapturesStrategy
 * @extends DBService
 * @see CSVImportStrategy
 *
 */
export class ImportCapturesStrategy extends DBService implements CSVImportStrategy {
  surveyCritterService: SurveyCritterService;
  surveyId: number;

  /**
   * An XLSX validation config for the standard columns of a Critterbase Capture CSV.
   *
   * Note: `satisfies` allows `keyof` to correctly infer keyof type, while also
   * enforcing uppercase object keys.
   */
  columnValidator = {
    ALIAS: { type: 'string', aliases: CSV_COLUMN_ALIASES.ALIAS },
    CAPTURE_DATE: { type: 'date' },
    CAPTURE_TIME: { type: 'string', optional: true },
    CAPTURE_LATITUDE: { type: 'number' },
    CAPTURE_LONGITUDE: { type: 'number' },
    RELEASE_DATE: { type: 'date', optional: true },
    RELEASE_TIME: { type: 'string', optional: true },
    RELEASE_LATITUDE: { type: 'number', optional: true },
    RELEASE_LONGITUDE: { type: 'number', optional: true },
    CAPTURE_COMMENT: { type: 'string', optional: true },
    RELEASE_COMMENT: { type: 'string', optional: true }
  } satisfies IXLSXCSVValidator;

  /**
   * Construct an instance of ImportCapturesStrategy.
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} surveyId
   */
  constructor(connection: IDBConnection, surveyId: number) {
    super(connection);

    this.surveyId = surveyId;

    this.surveyCritterService = new SurveyCritterService(connection);
  }

  /**
   * Validate the CSV rows against zod schema.
   *
   * @param {Row[]} rows - CSV rows
   * @returns {*}
   */
  async validateRows(rows: Row[]) {
    // Generate type-safe cell getter from column validator
    const getColumnCell = generateColumnCellGetterFromColumnValidator(this.columnValidator);
    const critterAliasMap = await this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId);

    const rowsToValidate = [];

    for (const row of rows) {
      let critterId, captureId;

      const alias = getColumnCell<string>(row, 'ALIAS');

      const releaseLatitude = getColumnCell(row, 'RELEASE_LATITUDE');
      const releaseLongitude = getColumnCell(row, 'RELEASE_LONGITUDE');
      const captureDate = getColumnCell(row, 'CAPTURE_DATE');
      const captureTime = getColumnCell(row, 'CAPTURE_TIME');
      const releaseTime = getColumnCell(row, 'RELEASE_TIME');

      const releaseLocationId = releaseLatitude.cell && releaseLongitude.cell ? uuid() : undefined;
      const formattedCaptureTime = formatTimeString(captureTime.cell);
      const formattedReleaseTime = formatTimeString(releaseTime.cell);

      // If the alias is included attempt to retrieve the critterId from row
      // Checks if date time fields are unique for the critter's captures
      if (alias.cell) {
        const critter = critterAliasMap.get(alias.cell.toLowerCase());
        if (critter) {
          const captures = findCapturesFromDateTime(critter.captures, captureDate.cell, captureTime.cell);
          critterId = critter.critter_id;
          // Only set the captureId if a capture does not exist with matching date time
          captureId = captures.length > 0 ? undefined : uuid();
        }
      }

      rowsToValidate.push({
        capture_id: captureId, // this will be undefined if capture exists with same date / time
        critter_id: critterId,
        capture_location_id: uuid(),
        capture_date: captureDate.cell,
        capture_time: formattedCaptureTime,
        capture_latitude: getColumnCell(row, 'CAPTURE_LATITUDE').cell,
        capture_longitude: getColumnCell(row, 'CAPTURE_LONGITUDE').cell,
        release_location_id: releaseLocationId,
        release_date: getColumnCell(row, 'RELEASE_DATE').cell,
        release_time: formattedReleaseTime,
        release_latitude: getColumnCell(row, 'RELEASE_LATITUDE').cell,
        release_longitude: getColumnCell(row, 'RELEASE_LONGITUDE').cell,
        capture_comment: getColumnCell(row, 'CAPTURE_COMMENT').cell,
        release_comment: getColumnCell(row, 'RELEASE_COMMENT').cell
      });
    }

    return z.array(CsvCaptureSchema).safeParseAsync(rowsToValidate);
  }

  /**
   * Insert captures into Critterbase.
   *
   * @async
   * @param {CsvCapture[]} captures - List of CSV captures to create
   * @returns {Promise<number>} Number of created captures
   */
  async insert(captures: CsvCapture[]): Promise<number> {
    const critterbasePayload: { captures: ICapture[]; locations: ILocation[] } = { captures: [], locations: [] };

    for (const row of captures) {
      const { capture_latitude, capture_longitude, release_latitude, release_longitude, ...capture } = row;

      // Push the critter captures into payload
      critterbasePayload.captures.push(capture);

      // Push the capture location
      critterbasePayload.locations.push({
        location_id: row.capture_location_id,
        latitude: capture_latitude,
        longitude: capture_longitude
      });

      // Push the capture release location if included
      if (row.release_location_id && release_latitude && release_longitude) {
        critterbasePayload.locations?.push({
          location_id: row.release_location_id,
          latitude: release_latitude,
          longitude: release_longitude
        });
      }
    }

    const response = await this.surveyCritterService.critterbaseService.bulkCreate(critterbasePayload);

    return response.created.captures;
  }
}
