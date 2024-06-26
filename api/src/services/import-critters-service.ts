import { flatten, toUpper } from 'lodash';
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
import { CritterbaseService } from './critterbase-service';
import { DBService } from './db-service';
import { PlatformService } from './platform-service';
import { SurveyCritterService } from './survey-critter-service';

/**
 * @class ImportCrittersService
 * @extends DBService
 */
export class ImportCrittersService extends DBService {
  /**
   * Critter CSV file
   */
  critterCsv: MediaFile;
  /**
   * CSV converted to xlsx WorkSheet
   */
  worksheet: WorkSheet;

  /**
   * Service Dependencies
   *
   */
  platformService: PlatformService;
  critterbaseService: CritterbaseService;
  surveyCritterService: SurveyCritterService;

  constructor(connection: IDBConnection, critterCsv: MediaFile) {
    super(connection);

    this.critterCsv = critterCsv;
    this.worksheet = getDefaultWorksheet(constructXLSXWorkbook(critterCsv));

    this.platformService = new PlatformService(connection);
    this.surveyCritterService = new SurveyCritterService(connection);
    this.critterbaseService = new CritterbaseService({
      keycloak_guid: connection.systemUserGUID(),
      username: connection.systemUserIdentifier()
    });
  }

  /**
   * Get the critter rows from the CSV worksheet.
   *
   * @returns {Partial<CsvCritter>[]} List of partial CSV Critters
   */
  get critterRows(): Partial<CsvCritter>[] {
    const worksheetRows = getWorksheetRowObjects(this.worksheet);
    const collectionUnitColumns = getNonStandardColumnNamesFromWorksheet(
      this.worksheet,
      critterStandardColumnValidator
    );

    return getCritterRowsToValidate(worksheetRows, collectionUnitColumns);
  }

  /**
   * Get a Set of valid ITIS TSNS from worksheet critter rows.
   *
   * @async
   * @param {Partial<CsvCritter>[]} critterRows - Rows of CSV worksheet.
   * @returns {Promise<Set<number>>} Unique Set of valid TSNS from worksheet.
   */
  async getUniqueTsnsFromCritterRows(critterRows: Partial<CsvCritter>[]): Promise<Set<number>> {
    // Get a list of unique tsns from the incoming critter row tsns
    const critterTsns = [...new Set(critterRows.map((row) => String(row.itis_tsn)))];

    // Query the platform service (taxonomy) for matching tsns
    const taxonomy = await this.platformService.getTaxonomyByTsns(critterTsns);

    // Convert to a unique Set of matching TSNs
    return new Set(taxonomy.map((taxon) => Number(taxon.tsn)));
  }

  /**
   * Get critter row zod validation config.
   *
   * @async
   * @param {number} surveyId - Survey ID.
   * @returns {Promise<CritterRowValidationConfig>}
   */
  async getRowValidationConfig(surveyId: number): Promise<CritterRowValidationConfig> {
    const [validRowTsns, surveyCritterAliases] = await Promise.all([
      this.getUniqueTsnsFromCritterRows(this.critterRows),
      this.surveyCritterService.getUniqueSurveyCritterAliases(surveyId)
    ]);

    const collectionCategories = await Promise.all(
      Array.from(validRowTsns).map((tsn) => this.critterbaseService.findTaxonCollectionCategories(String(tsn)))
    );

    const flatCollectionCategories = flatten([...new Set(collectionCategories)]);

    const uniqueCategories = flatCollectionCategories.map((category) => toUpper(category.category_name));

    console.log({ uniqueCategories });

    const collectionUnits = new Map([['POPULATION UNIT', new Set(['A', 'B'])]]);

    return {
      aliases: surveyCritterAliases,
      tsns: validRowTsns,
      collectionUnits: collectionUnits
    };
  }

  /**
   * Insert CSV critter rows into SIMS and Critterbase.
   *
   * @async
   * @param {number} surveyId - Survey ID.
   * @param {CsvCritter[]} critters - CSV row critters.
   * @throws {ApiGeneralError} - If unable to fully insert records into Critterbase.
   * @returns {Promise<number[]>} List of inserted survey critter ids.
   */
  async insertCsvCrittersIntoSimsAndCritterbase(surveyId: number, critters: CsvCritter[]): Promise<number[]> {
    // Get list of Critterbase critter_ids(uuid) - different than SIMS critter_ids(number)
    const critterIds = critters.map((critter) => critter.critter_id);

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

  async validate(surveyId: number): Promise<CsvCritter[]> {
    const critterRows = this.critterRows;

    console.log(critterRows);

    // Validate the standard columns in the CSV file
    if (!validateCsvFile(this.worksheet, critterStandardColumnValidator)) {
      throw new ApiGeneralError(`Column validator failed.`);
    }

    const rowValidationConfig = await this.getRowValidationConfig(surveyId);

    // Generate the row validation schema with injected configuration
    const validation = validateCritterRows(critterRows, rowValidationConfig);

    // Collect and throw errors and include zod row validation issues
    if (!validation.success) {
      throw new ApiGeneralError(`Failed to import Critter CSV. Column data validator failed.`, validation.error.issues);
    }

    return validation.data;
  }

  async import(surveyId: number) {
    // Validate the standard columns and the data of the CSV
    const critters = await this.validate(surveyId);

    // Insert the data into SIMS and Critterbase
    return this.insertCsvCrittersIntoSimsAndCritterbase(surveyId, critters);
  }
}
