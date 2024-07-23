import { keys, omit, toUpper, uniq } from 'lodash';
import { v4 as uuid } from 'uuid';
import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { ApiGeneralError } from '../../../errors/api-error';
import { getLogger } from '../../../utils/logger';
import { CSV_COLUMN_ALIASES } from '../../../utils/xlsx-utils/column-aliases';
import { generateCellGetterFromColumnValidator } from '../../../utils/xlsx-utils/column-validator-utils';
import { getNonStandardColumnNamesFromWorksheet, IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import {
  CritterbaseService,
  IBulkCreate,
  ICollection,
  ICollectionUnitWithCategory,
  ICreateCritter
} from '../../critterbase-service';
import { DBService } from '../../db-service';
import { PlatformService } from '../../platform-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { CSVImportService, Row, Validation, ValidationError } from '../csv-import-strategy.interface';
import { CsvCritter, PartialCsvCritter } from './import-critters-service.interface';

const defaultLog = getLogger('services/import/import-critters-service');

const CSV_CRITTER_SEX_OPTIONS = ['UNKNOWN', 'MALE', 'FEMALE', 'HERMAPHRODITIC'];

/**
 *
 * ImportCrittersService - Injected into CSVImportStrategy as the CSV import dependency
 *
 * @example new CSVImportStrategy(new ImportCrittersService(connection, surveyId)).import(file);
 *
 * @class ImportCrittersService
 * @extends DBService
 *
 */
export class ImportCrittersService extends DBService implements CSVImportService<CsvCritter> {
  platformService: PlatformService;
  critterbaseService: CritterbaseService;
  surveyCritterService: SurveyCritterService;

  surveyId: number;

  /**
   * An XLSX validation config for the standard columns of a Critter CSV.
   *
   * Note: `satisfies` allows `keyof` to correctly infer key types, while also
   * enforcing uppercase object keys.
   */
  columnValidator = {
    ITIS_TSN: { type: 'number', aliases: CSV_COLUMN_ALIASES.ITIS_TSN },
    SEX: { type: 'string' },
    ALIAS: { type: 'string', aliases: CSV_COLUMN_ALIASES.ALIAS },
    WLH_ID: { type: 'string' },
    DESCRIPTION: { type: 'string', aliases: CSV_COLUMN_ALIASES.DESCRIPTION }
  } satisfies IXLSXCSVValidator;

  /**
   * Instantiates an instance of ImportCrittersService
   *
   * @param {IDBConnection} connection - Database connection
   * @param {number} surveyId - Survey identifier
   */
  constructor(connection: IDBConnection, surveyId: number) {
    super(connection);

    this.surveyId = surveyId;

    this.platformService = new PlatformService(connection);
    this.surveyCritterService = new SurveyCritterService(connection);
    this.critterbaseService = new CritterbaseService({
      keycloak_guid: connection.systemUserGUID(),
      username: connection.systemUserIdentifier()
    });
  }

  /**
   * Get non-standard columns (collection unit columns) from worksheet.
   *
   * @param {WorkSheet} worksheet - Xlsx worksheet
   * @returns {string[]} Array of non-standard headers from CSV (worksheet)
   */
  _getNonStandardColumns(worksheet: WorkSheet) {
    return uniq(getNonStandardColumnNamesFromWorksheet(worksheet, this.columnValidator));
  }

  /**
   * Get critter from properties from row.
   *
   * @param {CsvCritter} row - Row object as CsvCritter
   * @returns {ICreateCritter} Create critter object
   */
  _getCritterFromRow(row: CsvCritter): ICreateCritter {
    return {
      critter_id: row.critter_id,
      sex: row.sex,
      itis_tsn: row.itis_tsn,
      animal_id: row.animal_id,
      wlh_id: row.wlh_id,
      critter_comment: row.critter_comment
    };
  }

  /**
   * Get list of collection units from row.
   *
   * @param {CsvCritter} row - Row object as a CsvCritter
   * @returns {ICollection[]} Array of collection units
   */
  _getCollectionUnitsFromRow(row: CsvCritter): ICollection[] {
    const critterId = row.critter_id;

    // Get portion of row object that is not a critter
    const partialRow = omit(row, keys(this._getCritterFromRow(row)));

    // Keys of collection units
    const collectionUnitKeys = keys(partialRow);

    // Return an array of formatted collection units for bulk create
    return collectionUnitKeys
      .filter((key) => partialRow[key])
      .map((key) => ({ collection_unit_id: partialRow[key], critter_id: critterId }));
  }

  /**
   * Get a Set of valid ITIS TSNS from xlsx worksheet rows.
   *
   * @async
   * @returns {Promise<string[]>} Unique Set of valid TSNS from worksheet.
   */
  async _getValidTsns(rows: PartialCsvCritter[]): Promise<string[]> {
    // Get a unique list of tsns from worksheet
    const critterTsns = uniq(rows.map((row) => String(row.itis_tsn)));

    // Query the platform service (taxonomy) for matching tsns
    const taxonomy = await this.platformService.getTaxonomyByTsns(critterTsns);

    return taxonomy.map((taxon) => taxon.tsn);
  }

  /**
   * Get a mapping of collection units for a list of tsns.
   * Used in the zod validation.
   *
   * @example new Map([['Population Unit', new Set(['Atlin', 'Unit B'])]]);
   *
   * @async
   * @param {WorkSheet} worksheet - Xlsx Worksheet
   * @param {string[]} tsns - List of unique and valid TSNS
   * @returns {Promise<Map<string, ICollectionUnitWithCategory[]>} Collection unit mapping
   */
  async _getCollectionUnitMap(worksheet: WorkSheet, tsns: string[]) {
    const collectionUnitMap = new Map<string, { collectionUnits: ICollectionUnitWithCategory[]; tsn: number }>();

    const collectionUnitColumns = this._getNonStandardColumns(worksheet);

    // If no collection unit columns return empty Map
    if (!collectionUnitColumns.length) {
      return collectionUnitMap;
    }

    // Get the collection units for all the tsns in the worksheet
    const tsnCollectionUnits = await Promise.all(
      tsns.map((tsn) => this.critterbaseService.findTaxonCollectionUnits(tsn))
    );

    tsnCollectionUnits.forEach((collectionUnits, index) => {
      if (collectionUnits.length) {
        collectionUnitMap.set(toUpper(collectionUnits[0].category_name), { collectionUnits, tsn: Number(tsns[index]) });
      }
    });

    return collectionUnitMap;
  }

  /**
   * Parse the CSV rows into the Critterbase critter format.
   *
   * @param {Row[]} rows - CSV rows
   * @param {string[]} collectionUnitColumns - Non standard columns
   * @returns {PartialCsvCritter[]} CSV critters before validation
   */
  _getRowsToValidate(rows: Row[], collectionUnitColumns: string[]): PartialCsvCritter[] {
    const getCellValue = generateCellGetterFromColumnValidator(this.columnValidator);

    return rows.map((row) => {
      // Standard critter properties from CSV
      const standardCritterRow = {
        critter_id: uuid(), // Generate a uuid for each critter for convienence
        sex: getCellValue(row, 'SEX'),
        itis_tsn: getCellValue(row, 'ITIS_TSN'),
        wlh_id: getCellValue(row, 'WLH_ID'),
        animal_id: getCellValue(row, 'ALIAS'),
        critter_comment: getCellValue(row, 'DESCRIPTION')
      };

      // All other properties must be collection units ie: `population unit` or `herd unit` etc...
      collectionUnitColumns.forEach((categoryHeader) => {
        standardCritterRow[categoryHeader] = row[categoryHeader];
      });

      return standardCritterRow;
    });
  }

  /**
   * Validate CSV worksheet rows against reference data.
   *
   * @async
   * @param {Row[]} rows - Invalidated CSV rows
   * @param {WorkSheet} worksheet - Xlsx worksheet
   * @returns {Promise<Validation<CsvCritter>>} Conditional validation object
   */
  async validateRows(rows: Row[], worksheet: WorkSheet): Promise<Validation<CsvCritter>> {
    const nonStandardColumns = this._getNonStandardColumns(worksheet);
    const rowsToValidate = this._getRowsToValidate(rows, nonStandardColumns);

    // Retrieve the dynamic validation config
    const [validRowTsns, surveyCritterAliases] = await Promise.all([
      this._getValidTsns(rowsToValidate),
      this.surveyCritterService.getUniqueSurveyCritterAliases(this.surveyId)
    ]);
    const collectionUnitMap = await this._getCollectionUnitMap(worksheet, validRowTsns);

    // Parse reference data for validation
    const tsnSet = new Set(validRowTsns.map((tsn) => Number(tsn)));
    const csvCritterAliases = rowsToValidate.map((row) => row.animal_id);

    // Track the row validation errors
    const errors: ValidationError[] = [];

    const csvCritters = rowsToValidate.map((row, index) => {
      /**
       * --------------------------------------------------------------------
       *                      STANDARD ROW VALIDATION
       * --------------------------------------------------------------------
       */

      // SEX is a required property and must be a correct value
      const invalidSex = !row.sex || !CSV_CRITTER_SEX_OPTIONS.includes(toUpper(row.sex));
      // WLH_ID must follow regex pattern
      const invalidWlhId = row.wlh_id && !/^\d{2}-.+/.exec(row.wlh_id);
      // ITIS_TSN is required and be a valid TSN
      const invalidTsn = !row.itis_tsn || !tsnSet.has(row.itis_tsn);
      // ALIAS is required and must not already exist in Survey or CSV
      const invalidAlias =
        !row.animal_id ||
        surveyCritterAliases.has(row.animal_id) ||
        csvCritterAliases.filter((value) => value === row.animal_id).length > 1;

      if (invalidSex) {
        errors.push({ row: index, message: `Invalid SEX. Expecting: ${CSV_CRITTER_SEX_OPTIONS.join(', ')}.` });
      }
      if (invalidWlhId) {
        errors.push({ row: index, message: `Invalid WLH_ID. Example format '10-1000R'.` });
      }
      if (invalidTsn) {
        errors.push({ row: index, message: `Invalid ITIS_TSN.` });
      }
      if (invalidAlias) {
        errors.push({ row: index, message: `Invalid ALIAS. Must be unique in Survey and CSV.` });
      }

      /**
       * --------------------------------------------------------------------
       *                      NON-STANDARD ROW VALIDATION
       * --------------------------------------------------------------------
       */

      nonStandardColumns.forEach((column) => {
        const collectionUnitColumn = collectionUnitMap.get(column);
        // Remove property if undefined or not a collection unit
        if (!collectionUnitColumn || !row[column]) {
          delete row[column];
          return;
        }
        // Attempt to find the collection unit with the cell value from the mapping
        const collectionUnitMatch = collectionUnitColumn.collectionUnits.find(
          (unit) => unit.unit_name.toLowerCase() === String(row[column]).toLowerCase()
        );
        // Collection unit must be a valid value
        if (!collectionUnitMatch) {
          errors.push({ row: index, message: `Invalid ${column}. Cell value is not valid.` });
        }
        // Collection unit must have correct TSN mapping
        else if (row.itis_tsn !== collectionUnitColumn.tsn) {
          errors.push({ row: index, message: `Invalid ${column}. Cell value not allowed for TSN.` });
        } else {
          // Update the cell to be the collection unit id
          row[column] = collectionUnitMatch.collection_unit_id;
        }
      });

      return row;
    });

    // If validation successful the rows should all be CsvCritters
    if (!errors.length) {
      return { success: true, data: csvCritters as CsvCritter[] };
    }

    return { success: false, error: { issues: errors } };
  }

  /**
   * Insert CSV critters into Critterbase and SIMS.
   *
   * @async
   * @param {CsvCritter[]} critterRows - CSV row critters
   * @throws {ApiGeneralError} - If unable to fully insert records into Critterbase
   * @returns {Promise<number[]>} List of inserted survey critter ids
   */
  async insert(critterRows: CsvCritter[]): Promise<number[]> {
    const simsPayload: string[] = [];
    const critterbasePayload: IBulkCreate = { critters: [], collections: [] };

    // Convert rows to Critterbase and SIMS payloads
    for (const row of critterRows) {
      simsPayload.push(row.critter_id);
      critterbasePayload.critters?.push(this._getCritterFromRow(row));
      critterbasePayload.collections = critterbasePayload.collections?.concat(this._getCollectionUnitsFromRow(row));
    }

    defaultLog.debug({ label: 'critter import payloads', simsPayload, critterbasePayload });

    // Add critters to Critterbase
    const bulkResponse = await this.critterbaseService.bulkCreate(critterbasePayload);

    // Check critterbase inserted the full list of critters
    // In reality this error should not be triggered, safeguard to prevent floating critter ids in SIMS
    if (bulkResponse.created.critters !== simsPayload.length) {
      throw new ApiGeneralError('Unable to fully import critters from CSV', [
        'importCrittersService -> insertCsvCrittersIntoSimsAndCritterbase',
        'critterbase bulk create response count !== critterIds.length'
      ]);
    }

    // Add Critters to SIMS survey
    return this.surveyCritterService.addCrittersToSurvey(this.surveyId, simsPayload);
  }
}
