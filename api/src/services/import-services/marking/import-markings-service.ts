import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { CSV_COLUMN_ALIASES } from '../../../utils/xlsx-utils/column-aliases';
import { generateCellGetterFromColumnValidator } from '../../../utils/xlsx-utils/column-validator-utils';
import { IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import { IBulkCreateMarking } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { CSVImportService, Row } from '../csv-import-strategy.interface';
import { findCaptureIdFromDateTime } from '../utils/datetime';
import { CsvMarking, getCsvMarkingSchema } from './import-markings-service.interface';

/**
 *
 * @class ImportMarkingsService
 * @extends DBService
 * @see CSVImportStrategy
 *
 */
export class ImportMarkingsService extends DBService implements CSVImportService {
  surveyCritterService: SurveyCritterService;
  surveyId: number;

  /**
   * An XLSX validation config for the standard columns of a Critterbase Marking CSV.
   *
   * Note: `satisfies` allows `keyof` to correctly infer keyof type, while also
   * enforcing uppercase object keys.
   */
  columnValidator = {
    ALIAS: { type: 'string', aliases: CSV_COLUMN_ALIASES.ALIAS },
    CAPTURE_DATE: { type: 'date' },
    CAPTURE_TIME: { type: 'string', optional: true },
    BODY_LOCATION: { type: 'string', optional: true },
    MARKING_TYPE: { type: 'string', optional: true },
    IDENTIFIER: { type: 'string', optional: true },
    PRIMARY_COLOUR: { type: 'string', optional: true },
    SECONDARY_COLOUR: { type: 'string', optional: true },
    COMMENT: { type: 'string', aliases: CSV_COLUMN_ALIASES.DESCRIPTION, optional: true }
  } satisfies IXLSXCSVValidator;

  /**
   * Construct an instance of ImportMarkingsService.
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
    const getCellValue = generateCellGetterFromColumnValidator(this.columnValidator);

    // Get reference values
    const critterAliasMap = await this.surveyCritterService.getSurveyCritterIdAliasMap(this.surveyId);
    const colours = await this.surveyCritterService.critterbaseService.getColours();
    const markingTypes = await this.surveyCritterService.critterbaseService.getMarkingTypes();

    const rowsToValidate: Partial<CsvMarking>[] = [];

    for (const row of rows) {
      let critterId, captureId;

      const alias = getCellValue<string>(row, 'ALIAS');

      // If the alias is included attempt to retrieve the critter_id and capture_id for the row
      if (alias) {
        const captureDate = getCellValue(row, 'CAPTURE_DATE');
        const captureTime = getCellValue(row, 'CAPTURE_TIME');

        const critter = critterAliasMap.get(alias);

        // Find the capture_id from the date time columns
        captureId = findCaptureIdFromDateTime(critter?.captures ?? [], captureDate, captureTime);
        critterId = critter?.critter_id;
      }

      rowsToValidate.push({
        critter_id: critterId, // Found using alias
        capture_id: captureId, // Found using capture date and time
        body_location: getCellValue(row, 'BODY_LOCATION'),
        marking_type: getCellValue(row, 'MARKING_TYPE'),
        identifier: getCellValue(row, 'IDENTIFIER'),
        primary_colour: getCellValue(row, 'PRIMARY_COLOUR'),
        secondary_colour: getCellValue(row, 'SECONDARY_COLOUR'),
        comment: getCellValue(row, 'COMMENT')
      });
    }

    // Generate the zod schema with injected lookup values
    return z.array(getCsvMarkingSchema(colours, markingTypes)).safeParseAsync(rowsToValidate);
  }

  /**
   * Insert markings into Critterbase.
   *
   * @async
   * @param {CsvCapture[]} markings - List of CSV markings to create
   * @returns {Promise<number>} Number of created markings
   */
  async insert(markings: CsvMarking[]): Promise<number> {
    const critterbasePayload: { markings: IBulkCreateMarking[] } = { markings };

    const response = await this.surveyCritterService.critterbaseService.bulkCreate(critterbasePayload);

    return response.created.markings;
  }
}
