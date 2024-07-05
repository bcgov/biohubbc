import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import {
  getCaptureDateFromRow,
  getCaptureTimeFromRow,
  getDescriptionFromRow,
  getMarkingBodyPositionFromRow,
  getMarkingIdentifierFromRow,
  getMarkingPrimaryColourFromRow,
  getMarkingSecondaryColourFromRow,
  getMarkingTypeFromRow,
  markingStandardColumnValidator
} from '../../../utils/xlsx-utils/column-cell-utils';
import { IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import { CritterbaseService } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { CSVImportService, Row } from '../import-types';
import { CsvMarking, CsvMarkingSchema, PartialCsvMarking } from './import-marking-service.interface';

/**
 *
 * @class ImportCapturesService
 * @extends DBService
 *
 */
export class ImportMarkingService extends DBService implements CSVImportService<CsvMarking, PartialCsvMarking> {
  critterbaseCritterId?: string;

  columnValidator: IXLSXCSVValidator;

  critterbaseService: CritterbaseService;

  /**
   * Construct an instance of ImportCapturesService
   *
   * @param {IDBConnection} connection - DB connection
   */
  constructor(connection: IDBConnection, critterbaseCritterId?: string) {
    super(connection);

    this.critterbaseCritterId = critterbaseCritterId;

    this.columnValidator = markingStandardColumnValidator;

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
  _getCritterIdFromRow(row: Row): string {
    if (this.critterbaseCritterId) {
      // Bulk importing markings for a known critter
      return this.critterbaseCritterId;
    }
    // Attempt to retrieve the critter id with the alias and survey ID
    return `TEMP PLACEHOLDER FOR CRITTER ID RETRIEVAL ${row}`;
  }

  /**
   * Parse the CSV rows into the Critterbase marking format for validation.
   *
   * @param {Row[]} rows - CSV rows
   * @returns {PartialCsvMarking[]} CSV markings before validation
   */
  getRowsToValidate(rows: Row[]): PartialCsvMarking[] {
    return rows.map((row) => ({
      critter_id: this._getCritterIdFromRow(row), // only property we know will be defined
      capture_date: getCaptureDateFromRow(row),
      capture_time: getCaptureTimeFromRow(row),
      marking_position: getMarkingBodyPositionFromRow(row),
      marking_type: getMarkingTypeFromRow(row),
      identifier: getMarkingIdentifierFromRow(row),
      primary_colour: getMarkingPrimaryColourFromRow(row),
      secondary_colour: getMarkingSecondaryColourFromRow(row),
      comment: getDescriptionFromRow(row)
    }));
  }

  /**
   * Validate the CSV rows with zod schema.
   *
   * @param {PartialCsvMarking} rows - CSV rows to validate
   * @returns {*} Zod safe parse validation
   */
  async validateRows(rows: PartialCsvMarking[]) {
    return z.array(CsvMarkingSchema).safeParse(rows);
  }

  /**
   * Insert markings into Critterbase.
   *
   * @async
   * @param {CsvMarking[]} markings - List of CSV markings to create
   * @returns {Promise<ICapture[]>} List of created markings
   */
  async insert(markings: CsvMarking[]) {}
}
