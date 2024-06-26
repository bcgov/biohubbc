import { keys, omit, toUpper, uniq } from 'lodash';
import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../database/db';
import { ApiGeneralError } from '../errors/api-error';
import {
  CritterRowValidationConfig,
  CsvCritter,
  getCritterRowsToValidate,
  validateCritterRows
} from '../utils/critter-xlsx-utils/critter-column-utils';
import { MediaFile } from '../utils/media/media-file';
import { critterStandardColumnValidator } from '../utils/xlsx-utils/column-cell-utils';
import {
  constructXLSXWorkbook,
  getDefaultWorksheet,
  getNonStandardColumnNamesFromWorksheet,
  getWorksheetRowObjects,
  validateCsvFile
} from '../utils/xlsx-utils/worksheet-utils';
import { CritterbaseService, ICollectionUnitWithCategory, ICreateCritter } from './critterbase-service';
import { DBService } from './db-service';
import { PlatformService } from './platform-service';
import { SurveyCritterService } from './survey-critter-service';

/**
 *
 * @class ImportCrittersService
 * @extends DBService
 *
 */
export class ImportCrittersService extends DBService {
  platformService: PlatformService;
  critterbaseService: CritterbaseService;
  surveyCritterService: SurveyCritterService;

  _rows?: Partial<CsvCritter>[];

  constructor(connection: IDBConnection) {
    super(connection);

    this.platformService = new PlatformService(connection);
    this.surveyCritterService = new SurveyCritterService(connection);
    this.critterbaseService = new CritterbaseService({
      keycloak_guid: connection.systemUserGUID(),
      username: connection.systemUserIdentifier()
    });
  }

  /**
   * Get the worksheet from the CSV file.
   *
   * @param {MediaFile} critterCsv - CSV MediaFile
   * @returns {WorkSheet} Xlsx worksheet
   */
  _getWorksheet(critterCsv: MediaFile) {
    return getDefaultWorksheet(constructXLSXWorkbook(critterCsv));
  }

  /**
   * Get non-standard columns (collection unit columns) from worksheet.
   *
   * @param {WorkSheet} worksheet - Xlsx worksheet
   * @returns {string[]} Array of non-standard headers from CSV (worksheet)
   */
  _getCollectionUnitColumns(worksheet: WorkSheet) {
    return uniq(getNonStandardColumnNamesFromWorksheet(worksheet, critterStandardColumnValidator));
  }

  /**
   * Get the critter rows from the xlsx worksheet.
   *
   * @returns {Partial<CsvCritter>[]} List of partial CSV Critters
   */
  _getRows(worksheet: WorkSheet) {
    // Attempt to retrieve from rows property to prevent unnecessary parsing
    if (this._rows) {
      return this._rows;
    }

    // Convert the worksheet into an array of records
    const worksheetRows = getWorksheetRowObjects(worksheet);

    // Get the collection unit columns (all non standard columns)
    const collectionUnitColumns = this._getCollectionUnitColumns(worksheet);

    // Pre parse the records into partial critter rows
    this._rows = getCritterRowsToValidate(worksheetRows, collectionUnitColumns);

    return this._rows;
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
   * Get collection unit properties from row.
   *
   * @param {CsvCritter} row - Row object as a CsvCritter
   * TODO: type this
   */
  _getCollectionUnitsFromRow(row: CsvCritter) {
    //const critterId = row.critter_id;

    // Get portion of row object that is not a critter
    const partialRow = omit(row, keys(this._getCritterFromRow(row)));

    return partialRow;
  }

  /**
   * Get a Set of valid ITIS TSNS from xlsx worksheet.
   *
   * @async
   * @param {WorkSheet} worksheet - Xlsx Worksheet
   * @returns {Promise<string[]>} Unique Set of valid TSNS from worksheet.
   */
  async _getValidTsns(worksheet: WorkSheet): Promise<string[]> {
    const rows = this._getRows(worksheet);

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
    const collectionUnitMap = new Map<string, ICollectionUnitWithCategory[]>();

    const collectionUnitColumns = this._getCollectionUnitColumns(worksheet);

    // If no collection unit columns return empty Map
    if (!collectionUnitColumns.length) {
      return collectionUnitMap;
    }

    // Get the collection units for all the tsns in the worksheet
    const tsnCollectionUnits = await Promise.all(
      tsns.map((tsn) => this.critterbaseService.findTaxonCollectionUnits(tsn))
    );

    for (const collectionUnits of tsnCollectionUnits) {
      if (collectionUnits.length) {
        collectionUnitMap.set(toUpper(collectionUnits[0].category_name), collectionUnits);
      }
    }

    return collectionUnitMap;
  }

  /**
   * Get critter row zod validation config.
   *
   * @async
   * @param {number} surveyId - Survey ID
   * @param {WorkSheet} worksheet - Xlsx Worksheet
   * @returns {Promise<CritterRowValidationConfig>} Custom zod validation configuration
   */
  async _getRowValidationConfig(surveyId: number, worksheet: WorkSheet): Promise<CritterRowValidationConfig> {
    const [validRowTsns, surveyCritterAliases] = await Promise.all([
      this._getValidTsns(worksheet),
      this.surveyCritterService.getUniqueSurveyCritterAliases(surveyId)
    ]);

    const collectionUnitMap = await this._getCollectionUnitMap(worksheet, validRowTsns);

    return {
      aliases: surveyCritterAliases,
      tsns: new Set(validRowTsns.map((tsn) => Number(tsn))),
      collectionUnits: collectionUnitMap
    };
  }

  /**
   * Validate the worksheet contains no errors within the data or structure of CSV.
   *
   * @async
   * @param {number} surveyId - Survey identifier
   * @param {WorkSheet} worksheet - Xlsx worksheet
   * @throws {ApiGeneralError} - If validation fails
   * @returns {Promise<CsvCritter[]>} Validated CSV rows
   */
  async _validate(surveyId: number, worksheet: WorkSheet): Promise<CsvCritter[]> {
    const rows = this._getRows(worksheet);

    // Validate the standard columns in the CSV file
    if (!validateCsvFile(worksheet, critterStandardColumnValidator)) {
      throw new ApiGeneralError(`Column validator failed.`);
    }

    // Get the validation config for the generated zod schema
    const rowValidationConfig = await this._getRowValidationConfig(surveyId, worksheet);

    // Generate the row validation schema with injected configuration
    const validation = validateCritterRows(rows, rowValidationConfig);

    // Collect and throw errors and include zod row validation issues
    if (!validation.success) {
      throw new ApiGeneralError(`Failed to import Critter CSV. Column data validator failed.`, validation.error.issues);
    }

    return validation.data;
  }

  /**
   * Insert CSV critter rows into SIMS and Critterbase.
   *
   * @async
   * @param {number} surveyId - Survey identifier
   * @param {CsvCritter[]} critterRows - CSV row critters
   * @throws {ApiGeneralError} - If unable to fully insert records into Critterbase
   * @returns {Promise<number[]>} List of inserted survey critter ids
   */
  async _insertCsvCrittersIntoSimsAndCritterbase(surveyId: number, critterRows: CsvCritter[]): Promise<number[]> {
    console.log(critterRows);

    const critterIds = [];
    const critters = [];
    //const collectionUnits = [];

    for (const row of critterRows) {
      critterIds.push(row.critter_id);
      critters.push(this._getCritterFromRow(row));
    }

    // Add critters to Critterbase
    const bulkResponse = await this.critterbaseService.bulkCreate({ critters });

    // Check critterbase inserted the full list of critters
    if (bulkResponse.created.critters !== critterIds.length) {
      throw new ApiGeneralError('Unable to fully import critters from CSV', [
        'importCritterService->insertCsvCrittersIntoSimsAndCritterbase',
        'critterbase bulk create response count !== critterIds.length'
      ]);
    }

    // Add Critters to SIMS survey
    return this.surveyCritterService.addCrittersToSurvey(surveyId, critterIds);
  }

  /**
   * Import the CSV into SIMS and Critterbase.
   *
   * @async
   * @param {number} surveyId - Survey identifier
   * @param {MediaFile} critterCsv - CSV MediaFile
   * @returns {Promise<number[]>} List of survey critter identifiers
   */
  async import(surveyId: number, critterCsv: MediaFile): Promise<number[]> {
    // Get the worksheet from the CSV
    const worksheet = this._getWorksheet(critterCsv);

    // Validate the standard columns and the data of the CSV
    const critters = await this._validate(surveyId, worksheet);

    // Insert the data into SIMS and Critterbase
    return this._insertCsvCrittersIntoSimsAndCritterbase(surveyId, critters);
  }
}
