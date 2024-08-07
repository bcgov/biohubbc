import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { CSV_COLUMN_ALIASES } from '../../../utils/xlsx-utils/column-aliases';
import { generateCellGetterFromColumnValidator } from '../../../utils/xlsx-utils/column-validator-utils';
import { IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import { IBulkCreateMarking } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { CSVImportService, Row } from '../csv-import-strategy.interface';
import { areDatesEqual, formatTimeString } from '../utils/datetime';
import { CsvMarking, CsvMarkingSchema } from './import-markings-service.interface';

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
    const critterAliasMap = await this.surveyCritterService.getSurveyCritterIdAliasMap(this.surveyId);

    const rowsToValidate: Partial<CsvMarking>[] = [];

    for (const row of rows) {
      const alias = getCellValue<string>(row, 'ALIAS');
      let critterId, captureId;

      if (alias) {
        const critter = critterAliasMap.get(alias);
        const captureDate = getCellValue(row, 'CAPTURE_DATE');
        const captureTime = formatTimeString(getCellValue(row, 'CAPTURE_TIME'));

        critterId = critter?.critter_id;
        captureId = critter?.captures.find((capture) => {
          return (
            (formatTimeString(capture.capture_time) === formatTimeString(captureTime) &&
              areDatesEqual(capture.capture_date, captureDate)) ||
            areDatesEqual(capture.capture_date, captureDate)
          );
        })?.capture_id;
      }

      rowsToValidate.push({
        critter_id: critterId,
        capture_id: captureId,
        body_location: getCellValue(row, 'BODY_LOCATION'),
        marking_type: getCellValue(row, 'MARKING_TYPE'),
        identifier: getCellValue(row, 'IDENTIFIER'),
        primary_colour: getCellValue(row, 'PRIMARY_COLOUR'),
        secondary_colour: getCellValue(row, 'SECONDARY_COLOUR'),
        comment: getCellValue(row, 'COMMENT')
      });
    }

    return z.array(CsvMarkingSchema).safeParseAsync(rowsToValidate);
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
