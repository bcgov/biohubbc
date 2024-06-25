import { IDBConnection } from '../database/db';
import { ApiGeneralError } from '../errors/api-error';
import { SurveyCritterRecord, SurveyCritterRepository } from '../repositories/survey-critter-repository';
import {
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

/**
 * Service layer for survey critters.
 *
 * @export
 * @class SurveyCritterService
 * @extends {DBService}
 */
export class SurveyCritterService extends DBService {
  critterRepository: SurveyCritterRepository;
  platformService: PlatformService;
  critterbaseService: CritterbaseService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.critterRepository = new SurveyCritterRepository(connection);
    this.platformService = new PlatformService(connection);
    this.critterbaseService = new CritterbaseService({
      keycloak_guid: connection.systemUserGUID(),
      username: connection.systemUserIdentifier()
    });
  }

  /**
   * Get all critter associations for the given survey. This only gets you critter ids, which can be used to fetch details from the external system.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyCritterRecord[]>}
   * @memberof SurveyCritterService
   */
  async getCrittersInSurvey(surveyId: number): Promise<SurveyCritterRecord[]> {
    return this.critterRepository.getCrittersInSurvey(surveyId);
  }

  /**
   * Add a critter to a survey. Does not create anything in the external system.
   *
   * @param {number} surveyId
   * @param {string} critterBaseCritterId
   * @return {*}  {Promise<number>}
   * @memberof SurveyCritterService
   */
  async addCritterToSurvey(surveyId: number, critterBaseCritterId: string): Promise<number> {
    const response = await this.critterRepository.addCrittersToSurvey(surveyId, [critterBaseCritterId]);

    return response[0];
  }

  /**
   * Add multiple critters to a survey. Does not create anything in the external system.
   *
   * @param {number} surveyId
   * @param {string} critterBaseCritterIds
   * @return {*}  {Promise<number>}
   * @memberof SurveyCritterService
   */
  async addCrittersToSurvey(surveyId: number, critterBaseCritterIds: string[]): Promise<number[]> {
    return this.critterRepository.addCrittersToSurvey(surveyId, critterBaseCritterIds);
  }

  /**
   * Update critter already in survey. Only touches audit columns.
   *
   * @param {number} critterId
   * @param {string} critterBaseCritterId
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterService
   */
  async updateCritter(critterId: number, critterBaseCritterId: string): Promise<void> {
    return this.critterRepository.updateCritter(critterId, critterBaseCritterId);
  }

  /**
   * Removes critters from the survey. Does not affect the critters in the external system.
   *
   * @param {number} surveyId
   * @param {number[]} critterIds
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterService
   */
  async removeCrittersFromSurvey(surveyId: number, critterIds: number[]): Promise<void> {
    return this.critterRepository.removeCrittersFromSurvey(surveyId, critterIds);
  }

  /**
   * Upsert a deployment row into SIMS.
   *
   * @param {number} critterId
   * @param {string} deplyomentId
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterService
   */
  async upsertDeployment(critterId: number, deplyomentId: string): Promise<void> {
    return this.critterRepository.upsertDeployment(critterId, deplyomentId);
  }

  /**
   * Removes the deployment in SIMS.
   *
   * @param {number} critterId
   * @param {string} deploymentId the bctw deployment uuid
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterService
   */
  async removeDeployment(critterId: number, deploymentId: string): Promise<void> {
    return this.critterRepository.removeDeployment(critterId, deploymentId);
  }

  /**
   * Get unique Set of critter aliases (animal id / nickname) of a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ICritter[]>}
   * @memberof SurveyCritterService
   */
  async getUniqueSurveyCritterAliases(surveyId: number): Promise<Set<string>> {
    const surveyCritters = await this.getCrittersInSurvey(surveyId);

    const critterbaseCritterIds = surveyCritters.map((critter) => critter.critterbase_critter_id);

    const critters = await this.critterbaseService.getMultipleCrittersByIds(critterbaseCritterIds);

    // Return a unique Set of non-null critterbase aliases of a Survey
    // Note: The type from filtered critters should be Set<string> not Set<string | null>
    return new Set(critters.filter(Boolean).map((critter) => critter.animal_id)) as Set<string>;
  }

  /**
   * Import critters from CSV into SIMS and Critterbase.
   *
   * @async
   * @param {number} surveyId - Survey ID
   * @param {MediaFile} mediaFile - CSV file as MediaFile format
   * @throws {Error} - If issue validating CSV contents
   * @returns {Promise<CsvCritter[]>} CSV Critters
   */
  async validateCsvRowsForImport(surveyId: number, mediaFile: MediaFile): Promise<CsvCritter[]> {
    /**
     * ----------------------------------------------------------------
     *                            STEP 1
     * ----------------------------------------------------------------
     */

    // Construct the XLSX workbook
    const xlsxWorkBook = constructXLSXWorkbook(mediaFile);

    // Get the default XLSX worksheet
    const xlsxWorksheet = getDefaultWorksheet(xlsxWorkBook);

    // Validate the standard columns in the CSV file
    // and insure the cell properties match the defined type
    if (!validateCsvFile(xlsxWorksheet, critterStandardColumnValidator)) {
      throw new ApiGeneralError(
        `Failed to import Critter CSV. Column validator failed. Expecting columns ${critterStandardColumnValidator.columnNames.toString()}`
      );
    }

    // Get the worksheet row objects
    const worksheetRowObjects = getWorksheetRowObjects(xlsxWorksheet);

    /**
     * ----------------------------------------------------------------
     *                            STEP 2
     * ----------------------------------------------------------------
     */

    // This assumes all other columns are collection unit columns
    const collectionUnitColumns = getNonStandardColumnNamesFromWorksheet(xlsxWorksheet, critterStandardColumnValidator);

    // Pre parse the rows into critters
    const critterRows = getCritterRowsToValidate(worksheetRowObjects, collectionUnitColumns);

    // Get a list of unique tsns from the incoming critter row tsns
    const critterTsns = [...new Set(critterRows.map((row) => String(row.itis_tsn)))];

    // Query the platform service (taxonomy) for matching tsns
    const taxonomy = await this.platformService.getTaxonomyByTsns(critterTsns);

    // Convert to a unique Set of matching TSNs
    const validTsns = new Set(taxonomy.map((taxon) => Number(taxon.tsn)));

    const categories = await Promise.all(
      taxonomy.map((taxon) => this.critterbaseService.findTaxonCollectionCategories(taxon.tsn))
    );

    console.log({ categories });

    // Get all aliases / nicknames / animal ids of critters in survey
    const surveyCritterAliases = await this.getUniqueSurveyCritterAliases(surveyId);

    // Generate the row validation schema with injected configuration
    const validation = validateCritterRows(critterRows, {
      aliases: surveyCritterAliases,
      tsns: validTsns,
      collectionUnits: new Map([['POPULATION UNIT', new Set(['A', 'B'])]])
    });

    // Collect and throw errors and include zod row validation issues
    if (!validation.success) {
      throw new ApiGeneralError(`Failed to import Critter CSV. Column data validator failed.`, validation.error.issues);
    }

    return validation.data;
  }

  /**
   * Import CSV Critters into Critterbase and add to SIMS survey.
   *
   * @async
   * @param {number} surveyId - Survey id
   * @param {CsvCritter[]} critters - Csv critters
   * @throws {ApiGeneralError} - If length of critterbase inserts !== what was provided
   * @returns {Promise<number[]>} Survey critter ids
   */
  async importCsvCrittersIntoSimsAndCritterbase(surveyId: number, critters: CsvCritter[]): Promise<number[]> {
    // Get list of Critterbase critter_ids(uuid) - different than SIMS critter_ids(number)
    const critterIds = critters.map((critter) => critter.critter_id);

    // Add critters to Critterbase
    const bulkResponse = await this.critterbaseService.bulkCreate({ critters });

    // Check critterbase inserted the full list of critters
    if (bulkResponse.created.critters !== critterIds.length) {
      throw new ApiGeneralError('Unable to fully import critters from CSV', [
        'surveyCritterService->importCsvCritters',
        'critterbase bulk create response count !== critterIds.length'
      ]);
    }

    // Add Critters to SIMS survey
    const surveyCritterIds = await this.addCrittersToSurvey(surveyId, critterIds);

    return surveyCritterIds;
  }

  async importCritterCsv(surveyId: number, mediaFile: MediaFile): Promise<number[]> {
    const importData = await this.validateCsvRowsForImport(surveyId, mediaFile);

    return this.importCsvCrittersIntoSimsAndCritterbase(surveyId, importData);
  }
}
