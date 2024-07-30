import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { generateCellGetterFromColumnValidator } from '../../../utils/xlsx-utils/column-validator-utils';
import { IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import { CritterbaseService, ILocation } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { CSVImportService, Row } from '../csv-import-strategy.interface';
import { CsvMarking, CsvMarkingSchema, IMarking } from './import-markings-service.interface';

/**
 *
 * @class ImportMarkingsService
 * @extends DBService
 * @see CSVImportStrategy
 *
 */
export class ImportMarkingsService extends DBService implements CSVImportService {
  critterbaseService: CritterbaseService;
  critterbaseCritterId: string;
  critterbaseCaptureId: string;

  /**
   * An XLSX validation config for the standard columns of a Critterbase Capture CSV.
   *
   * Note: `satisfies` allows `keyof` to correctly infer keyof type, while also
   * enforcing uppercase object keys.
   */
  columnValidator = {
    //CAPTURE_DATE: { type: 'date' },
    //CAPTURE_TIME: { type: 'time' },
    BODY_POSITION: { type: 'string', optional: true },
    MARKING_TYPE: { type: 'string', optional: true },
    IDENTIFIER: { type: 'string', optional: true },
    PRIMARY_COLOUR: { type: 'string', optional: true },
    SECONDARY_COLOUR: { type: 'string', optional: true },
    COMMENT: { type: 'string' }
  } satisfies IXLSXCSVValidator;

  /**
   * Construct an instance of ImportMarkingsService.
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} critterbaseCritterId - Critterbase Critter UUID
   * @param {string} critterbaseCaptureId - Critterbase Capture UUID
   */
  constructor(connection: IDBConnection, critterbaseCritterId: string, critterbaseCaptureId: string) {
    super(connection);

    this.critterbaseCritterId = critterbaseCritterId;
    this.critterbaseCaptureId = critterbaseCaptureId;

    this.critterbaseService = new CritterbaseService({
      keycloak_guid: connection.systemUserGUID(),
      username: connection.systemUserIdentifier()
    });
  }

  /**
   * Get critter id.
   *
   * Note: When this component is extended this function can be overridden
   * to fetch the critter_id with survey_id and critter alias.
   *
   * @async
   * @param {Row} [_row] - CSV row
   * @returns {Promise<string>} Critterbase critter id (UUID)
   */
  async getCritterId(_row?: Row) {
    return this.critterbaseCritterId;
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

    const rowsToValidate = [];

    for (const row of rows) {
      rowsToValidate.push({});
    }

    return z.array(CsvMarkingSchema).safeParseAsync(rowsToValidate);
  }

  /**
   * Insert markings into Critterbase.
   *
   * @async
   * @param {CsvMarking[]} markings - List of CSV markings to create
   * @returns {Promise<number>} Number of created markings
   */
  async insert(markings: CsvMarking[]): Promise<number> {
    const critterbasePayload: { markings: IMarking[]; locations: ILocation[] } = { markings: [], locations: [] };

    for (const row of markings) {
    }

    const response = await this.critterbaseService.bulkCreate(critterbasePayload);

    return response.created.markings;
  }
}
