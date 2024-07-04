import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { ApiGeneralError } from '../../../errors/api-error';
import { MediaFile } from '../../../utils/media/media-file';
import {
  captureStandardColumnValidator,
  getCaptureDateFromRow,
  getCaptureTimeFromRow,
  getColumnValidatorSpecification,
  getDescriptionFromRow,
  getMarkingBodyPositionFromRow,
  getMarkingIdentifierFromRow,
  getMarkingPrimaryColourFromRow,
  getMarkingSecondaryColourFromRow,
  getMarkingTypeFromRow
} from '../../../utils/xlsx-utils/column-cell-utils';
import {
  constructXLSXWorkbook,
  getDefaultWorksheet,
  getWorksheetRowObjects,
  validateCsvFile
} from '../../../utils/xlsx-utils/worksheet-utils';
import { CritterbaseService } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { Row } from '../import-types';
import { CsvMarking, CsvMarkingSchema, PartialCsvMarking } from './import-marking-service.interface';

/**
 *
 * @class ImportCapturesService
 * @extends DBService
 *
 */
export class ImportMarkingService extends DBService {
  critterbaseCritterId?: string;
  critterbaseService: CritterbaseService;

  _rows?: PartialCsvMarking[];

  /**
   * Construct an instance of ImportCapturesService
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} [critterbaseCritterId] - Critterbse critter ID if importing Captures for specific Critter
   */
  constructor(connection: IDBConnection, critterbaseCritterId?: string) {
    super(connection);

    /**
     * Critter ID is provided if attempting to bulk import Captures for a known Critter.
     * One (critter) -> Many (captures)
     *
     */
    this.critterbaseCritterId = critterbaseCritterId;

    this.critterbaseService = new CritterbaseService({
      keycloak_guid: connection.systemUserGUID(),
      username: connection.systemUserIdentifier()
    });
  }

  /**
   * Get the worksheet from the CSV file.
   *
   * @param {MediaFile} markingCsv - CSV MediaFile
   * @returns {WorkSheet} Xlsx worksheet
   */
  _getWorksheet(markingCsv: MediaFile): WorkSheet {
    return getDefaultWorksheet(constructXLSXWorkbook(markingCsv));
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
   * @returns {PartialCsvMarking[]} CSV captures before validation
   */
  _getMarkingRowsToValidate(rows: Row[]): PartialCsvMarking[] {
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
   * Get the marking rows from the xlsx worksheet.
   *
   * @param {WorkSheet} worksheet
   * @returns {PartialCsvMarking[]} List of partial CSV Captures
   */
  _getRows(worksheet: WorkSheet): PartialCsvMarking[] {
    // Attempt to retrieve from rows property to prevent unnecessary parsing
    if (this._rows) {
      return this._rows;
    }

    // Convert the worksheet into an array of records
    const worksheetRows = getWorksheetRowObjects(worksheet);

    // Pre parse the records into partial marking rows
    this._rows = this._getMarkingRowsToValidate(worksheetRows);

    return this._rows;
  }

  /**
   * Validate the CSV rows with zod schema.
   *
   * @param {WorkSheet} worksheet - Xlsx Worksheet
   * @returns {z.SafeParseReturnType<CsvMarking[], PartialCsvMarking[]>} Zod safe parse validation
   */
  _validateRows(worksheet: WorkSheet): z.SafeParseReturnType<PartialCsvMarking[], CsvMarking[]> {
    const rows = this._getRows(worksheet);
    return z.array(CsvMarkingSchema).safeParse(rows);
  }

  /**
   * Validate the worksheet contains no errors within the data or structure of CSV.
   *
   * @param {WorkSheet} worksheet - Xlsx worksheet
   * @throws {ApiGeneralError} - If validation fails
   * @returns {CsvMarking[]} Validated CSV rows
   */
  async _validate(worksheet: WorkSheet): Promise<CsvMarking[]> {
    // Validate the standard columns in the CSV file
    if (!validateCsvFile(worksheet, captureStandardColumnValidator)) {
      throw new ApiGeneralError(`Column validator failed. Column headers or cell data types are incorrect.`, [
        { column_specification: getColumnValidatorSpecification(captureStandardColumnValidator) },
        'importCapturesService->_validate->validateCsvFile'
      ]);
    }

    // Validate the CSV rows with reference data
    const validation = this._validateRows(worksheet);

    // Throw error is row validation failed and inject validation errors
    if (!validation.success) {
      throw new ApiGeneralError(`Failed to import Critter CSV. Column data validator failed.`, [
        { column_validation: validation.error.issues },
        'importCapturesService->_validate->_validateRows'
      ]);
    }

    return validation.data;
  }

  /**
   * Insert captures into Critterbase.
   *
   * @async
   * @param {CsvMarking[]} captures - List of CSV captures to create
   * @returns {Promise<ICapture[]>} List of created captures
   */
  async _insertCapturesIntoCritterbase(captures: CsvMarking[]) {
    //const createCapturePromises = captures.map((marking) => {
    //  const { capture_longitude, capture_latitude, release_latitude, release_longitude, ...payload } = marking;
    //
    //  return this.critterbaseService.createCapture({
    //    ...payload,
    //    capture_location: {
    //      latitude: capture_latitude,
    //      longitude: capture_longitude
    //    },
    //    release_location: {
    //      latitude: release_latitude ?? capture_latitude,
    //      longitude: release_longitude ?? capture_longitude
    //    }
    //  });
    //});
    //
    //return Promise.all(createCapturePromises);
  }

  /**
   * Import the CSV into SIMS and Critterbase.
   *
   * @async
   * @param {MediaFile} critterCsv - CSV MediaFile
   * @returns {*}
   */
  async import(critterCsv: MediaFile) {
    // Get the worksheet from the CSV
    const worksheet = this._getWorksheet(critterCsv);

    // Validate the standard columns and the data of the CSV
    const captures = await this._validate(worksheet);

    // Insert the captures into Critterbase
    return this._insertCapturesIntoCritterbase(captures);
  }
}
