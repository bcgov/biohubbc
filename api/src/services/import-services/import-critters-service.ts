import { keys, omit, toUpper, uniq } from 'lodash';
import { v4 as uuid } from 'uuid';
import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { getLogger } from '../../utils/logger';
import { MediaFile } from '../../utils/media/media-file';
import {
  critterStandardColumnValidator,
  getAliasFromRow,
  getColumnValidatorSpecification,
  getDescriptionFromRow,
  getSexFromRow,
  getTsnFromRow,
  getWlhIdFromRow
} from '../../utils/xlsx-utils/column-cell-utils';
import {
  constructXLSXWorkbook,
  getDefaultWorksheet,
  getNonStandardColumnNamesFromWorksheet,
  getWorksheetRowObjects,
  validateCsvFile
} from '../../utils/xlsx-utils/worksheet-utils';
import {
  CritterbaseService,
  IBulkCreate,
  ICollection,
  ICollectionUnitWithCategory,
  ICreateCritter
} from '../critterbase-service';
import { DBService } from '../db-service';
import { PlatformService } from '../platform-service';
import { SurveyCritterService } from '../survey-critter-service';
import { CsvCritter, PartialCsvCritter, Row, Validation, ValidationError } from './import-critters-service.interface';

const defaultLog = getLogger('services/import/import-critters-service');

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

  _rows?: PartialCsvCritter[];

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
  _getNonStandardColumns(worksheet: WorkSheet) {
    return uniq(getNonStandardColumnNamesFromWorksheet(worksheet, critterStandardColumnValidator));
  }
  /**
   * Parse the CSV rows into the Critterbase critter format.
   *
   * @param {Row[]} rows - CSV rows
   * @returns {PartialCsvCritter[]} CSV critters before validation
   */
  _getCritterRowsToValidate(rows: Row[], collectionUnitColumns: string[]): PartialCsvCritter[] {
    return rows.map((row) => {
      // Standard critter properties from CSV
      const standardCritterRow = {
        critter_id: uuid(), // Generate a uuid for each critter for convienence
        sex: getSexFromRow(row),
        itis_tsn: getTsnFromRow(row),
        wlh_id: getWlhIdFromRow(row),
        animal_id: getAliasFromRow(row),
        critter_comment: getDescriptionFromRow(row)
      };

      // All other properties must be collection units ie: `population unit` or `herd unit` etc...
      collectionUnitColumns.forEach((categoryHeader) => {
        standardCritterRow[categoryHeader] = row[categoryHeader];
      });

      return standardCritterRow;
    });
  }

  /**
   * Get the critter rows from the xlsx worksheet.
   *
   * @param {WorkSheet} worksheet
   * @returns {PartialCsvCritter[]} List of partial CSV Critters
   */
  _getRows(worksheet: WorkSheet) {
    // Attempt to retrieve from rows property to prevent unnecessary parsing
    if (this._rows) {
      return this._rows;
    }

    // Convert the worksheet into an array of records
    const worksheetRows = getWorksheetRowObjects(worksheet);

    // Get the collection unit columns (all non standard columns)
    const collectionUnitColumns = this._getNonStandardColumns(worksheet);

    // Pre parse the records into partial critter rows
    this._rows = this._getCritterRowsToValidate(worksheetRows, collectionUnitColumns);

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

  async _validateRows(surveyId: number, worksheet: WorkSheet): Promise<Validation> {
    const rows = this._getRows(worksheet);
    const nonStandardColumns = this._getNonStandardColumns(worksheet);

    // Retrieve the dynamic validation config
    const [validRowTsns, surveyCritterAliases] = await Promise.all([
      this._getValidTsns(worksheet),
      this.surveyCritterService.getUniqueSurveyCritterAliases(surveyId)
    ]);
    const collectionUnitMap = await this._getCollectionUnitMap(worksheet, validRowTsns);

    // Convert arrays to sets for validation
    const tsnSet = new Set(validRowTsns.map((tsn) => Number(tsn)));
    const allowedSexSet = new Set(['Unknown', 'Male', 'Female']);

    const errors: ValidationError[] = [];

    const csvCritters = rows.map((row, index) => {
      // SEX is a required property
      if (!row.sex || !allowedSexSet.has(row.sex)) {
        errors.push({ row: index, message: `Invalid SEX. Expecting ${allowedSexSet.values}.` });
      }
      // WLH_ID must follow regex pattern
      if (row.wlh_id && !row.wlh_id.match(/^\d{2}-.+/)) {
        errors.push({ row: index, message: `Invalid WLH_ID. Example format '10-1000R'.` });
      }
      // ITIS_TSN is required and be a valid TSN
      if (!row.itis_tsn || !tsnSet.has(row.itis_tsn)) {
        errors.push({ row: index, message: `Invalid ITIS_TSN.` });
      }
      // ALIAS is required and must not already exist in Survey
      // TODO: Remove dev check once complete (easier testing with same CSV)
      if (process.env.NODE_ENV !== 'development' && (!row.animal_id || surveyCritterAliases.has(row.animal_id))) {
        errors.push({ row: index, message: `Invalid ALIAS.` });
      }
      // Custom validation here
      nonStandardColumns.forEach((column) => {
        const collectionUnitColumn = collectionUnitMap.get(column);
        // Remove property if undefined or not a collection unit
        if (!collectionUnitColumn || !row[column]) {
          delete row[column];
          return;
        }
        // Attempt to find the collection unit with the cell value from the mapping
        const collectionUnitMatch = collectionUnitColumn.collectionUnits.find((unit) => unit.unit_name === row[column]);
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

    if (!errors.length) {
      return { success: true, data: csvCritters as CsvCritter[] };
    }

    return { success: false, errors };
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
    // Validate the standard columns in the CSV file
    if (!validateCsvFile(worksheet, critterStandardColumnValidator)) {
      throw new ApiGeneralError(`Column validator failed. Column headers or cell data types are incorrect.`, [
        { column_specification: getColumnValidatorSpecification(critterStandardColumnValidator) }
      ]);
    }

    const validation = await this._validateRows(surveyId, worksheet);

    if (!validation.success) {
      throw new ApiGeneralError(`Failed to import Critter CSV. Column data validator failed.`, validation.errors);
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
    const simsPayload: string[] = [];
    const critterbasePayload: IBulkCreate = { critters: [], collections: [] };

    for (const row of critterRows) {
      simsPayload.push(row.critter_id);

      critterbasePayload.critters?.push(this._getCritterFromRow(row));
      critterbasePayload.collections = critterbasePayload.collections?.concat(this._getCollectionUnitsFromRow(row));
    }

    defaultLog.info({ label: 'critter import payloads', simsPayload, critterbasePayload });

    // Add critters to Critterbase
    const bulkResponse = await this.critterbaseService.bulkCreate(critterbasePayload);

    // Check critterbase inserted the full list of critters
    if (bulkResponse.created.critters !== simsPayload.length) {
      throw new ApiGeneralError('Unable to fully import critters from CSV', [
        'importCritterService->insertCsvCrittersIntoSimsAndCritterbase',
        'critterbase bulk create response count !== critterIds.length'
      ]);
    }

    // Add Critters to SIMS survey
    return this.surveyCritterService.addCrittersToSurvey(surveyId, simsPayload);
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
