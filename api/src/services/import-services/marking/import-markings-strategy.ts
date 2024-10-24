import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { getLogger } from '../../../utils/logger';
import { CSV_COLUMN_ALIASES } from '../../../utils/xlsx-utils/column-aliases';
import { generateColumnCellGetterFromColumnValidator } from '../../../utils/xlsx-utils/column-validator-utils';
import { IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import { IAsSelectLookup, ICritterDetailed } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { CSVImportStrategy, Row } from '../import-csv.interface';
import { findCapturesFromDateTime } from '../utils/datetime';
import { CsvMarking, getCsvMarkingSchema } from './import-markings-strategy.interface';

const defaultLog = getLogger('services/import/import-markings-strategy');

/**
 *
 * @class ImportMarkingsStrategy
 * @extends DBService
 * @see CSVImport
 *
 */
export class ImportMarkingsStrategy extends DBService implements CSVImportStrategy {
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
    DESCRIPTION: { type: 'string', aliases: CSV_COLUMN_ALIASES.DESCRIPTION, optional: true }
  } satisfies IXLSXCSVValidator;

  /**
   * Construct an instance of ImportMarkingsStrategy.
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
   * Get taxon body locations Map from a list of Critters.
   *
   * @async
   * @param {ICritterDetailed[]} critters - List of detailed critters
   * @returns {Promise<Map<string, IAsSelectLookup[]>>} Critter id -> taxon body locations Map
   */
  async getTaxonBodyLocationsCritterIdMap(critters: ICritterDetailed[]): Promise<Map<string, IAsSelectLookup[]>> {
    const tsnBodyLocationsMap = new Map<number, IAsSelectLookup[]>();
    const critterBodyLocationsMap = new Map<string, IAsSelectLookup[]>();

    const uniqueTsns = Array.from(new Set(critters.map((critter) => critter.itis_tsn)));

    // Only fetch body locations for unique tsns
    const bodyLocations = await Promise.all(
      uniqueTsns.map((tsn) => this.surveyCritterService.critterbaseService.getTaxonBodyLocations(String(tsn)))
    );

    // Loop through the flattened responses and set the body locations for each tsn
    bodyLocations.flatMap((bodyLocationValues, idx) => {
      tsnBodyLocationsMap.set(uniqueTsns[idx], bodyLocationValues);
    });

    // Now loop through the critters and assign the body locations to the critter id
    for (const critter of critters) {
      const tsnBodyLocations = tsnBodyLocationsMap.get(critter.itis_tsn);
      if (tsnBodyLocations) {
        critterBodyLocationsMap.set(critter.critter_id, tsnBodyLocations);
      }
    }

    return critterBodyLocationsMap;
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

    // Get validation reference data
    const [critterAliasMap, colours, markingTypes] = await Promise.all([
      this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId),
      this.surveyCritterService.critterbaseService.getColours(),
      this.surveyCritterService.critterbaseService.getMarkingTypes()
    ]);

    // Used to find critter_id -> taxon body location [] map
    const rowCritters: ICritterDetailed[] = [];

    // Rows passed to validator
    const rowsToValidate: Partial<CsvMarking>[] = [];

    for (const row of rows) {
      let critterId, captureId;

      const alias = getColumnCell<string>(row, 'ALIAS');

      // If the alias is included attempt to retrieve the critter_id and capture_id for the row
      if (alias.cell) {
        const captureDate = getColumnCell(row, 'CAPTURE_DATE');
        const captureTime = getColumnCell(row, 'CAPTURE_TIME');

        const critter = critterAliasMap.get(alias.cell.toLowerCase());

        if (critter) {
          // Find the capture_id from the date time columns
          const captures = findCapturesFromDateTime(critter.captures, captureDate.cell, captureTime.cell);
          captureId = captures.length === 1 ? captures[0].capture_id : undefined;
          critterId = critter.critter_id;
          rowCritters.push(critter);
        }
      }

      rowsToValidate.push({
        critter_id: critterId, // Found using alias
        capture_id: captureId, // Found using capture date and time
        body_location: getColumnCell(row, 'BODY_LOCATION').cell,
        marking_type: getColumnCell(row, 'MARKING_TYPE').cell,
        identifier: getColumnCell(row, 'IDENTIFIER').cell,
        primary_colour: getColumnCell(row, 'PRIMARY_COLOUR').cell,
        secondary_colour: getColumnCell(row, 'SECONDARY_COLOUR').cell,
        comment: getColumnCell(row, 'DESCRIPTION').cell
      });
    }
    // Get the critter_id -> taxonBodyLocations[] Map
    const critterBodyLocationsMap = await this.getTaxonBodyLocationsCritterIdMap(rowCritters);

    // Generate the zod schema with injected reference values
    // This allows the zod schema to validate against Critterbase lookup values
    return z.array(getCsvMarkingSchema(colours, markingTypes, critterBodyLocationsMap)).safeParseAsync(rowsToValidate);
  }

  /**
   * Insert markings into Critterbase.
   *
   * @async
   * @param {CsvCapture[]} markings - List of CSV markings to create
   * @returns {Promise<number>} Number of created markings
   */
  async insert(markings: CsvMarking[]): Promise<number> {
    const response = await this.surveyCritterService.critterbaseService.bulkCreate({ markings });

    defaultLog.debug({ label: 'import markings', markings, insertedCount: response.created.markings });

    return response.created.markings;
  }
}
