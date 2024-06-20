import { IDBConnection } from '../database/db';
import { ApiGeneralError } from '../errors/api-error';
import { SurveyCritterRecord, SurveyCritterRepository } from '../repositories/survey-critter-repository';
import {
  CsvCritter,
  getCritterRowsToValidate,
  validateCritterRows
} from '../utils/critter-xlsx-utils/critter-column-utils';
import { getLogger } from '../utils/logger';
import { MediaFile } from '../utils/media/media-file';
import { critterStandardColumnValidator } from '../utils/observation-xlsx-utils/standard-column-utils';
import {
  constructXLSXWorkbook,
  getDefaultWorksheet,
  getWorksheetRowObjects,
  validateCsvFile
} from '../utils/xlsx-utils/worksheet-utils';
import { CritterbaseService } from './critterbase-service';
import { DBService } from './db-service';

const defaultLog = getLogger('services/survey-critter-service');

/**
 * Service layer for survey critters.
 *
 * @export
 * @class SurveyCritterService
 * @extends {DBService}
 */
export class SurveyCritterService extends DBService {
  critterRepository: SurveyCritterRepository;
  critterbaseService: CritterbaseService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.critterRepository = new SurveyCritterRepository(connection);
    this.critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
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
   * Add critters to a survey. Does not create anything in the external system.
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

    // Return a unique Set of non null critterbase aliases
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
  async validateCritterCsvForImport(surveyId: number, mediaFile: MediaFile) {
    const errorMessage = `Failed to import Critter CSV. Column validator failed.`;

    // Construct the XLSX workbook
    const xlsxWorkBook = constructXLSXWorkbook(mediaFile);

    // Get the default XLSX worksheet
    const xlsxWorksheet = getDefaultWorksheet(xlsxWorkBook);

    // Validate the standard columns in the CSV file
    if (!validateCsvFile(xlsxWorksheet, critterStandardColumnValidator)) {
      throw new ApiGeneralError(
        `${errorMessage} Expecting columns ${critterStandardColumnValidator.columnNames.toString()}`
      );
    }

    // Get the worksheet row objects
    const worksheetRowObjects = getWorksheetRowObjects(xlsxWorksheet);

    // Get all critter rows to validate
    const critterRows = getCritterRowsToValidate(worksheetRowObjects);

    // Get all aliases / nicknames / animal ids of critters in survey
    const surveyCritterAliases = await this.getUniqueSurveyCritterAliases(surveyId);

    // Validate critter row data
    if (!validateCritterRows(critterRows, surveyCritterAliases)) {
      throw new Error(errorMessage);
    }

    return critterRows;
  }

  /**
   * Import CSV Critters into Critterbase and add to SIMS survey.
   *
   * @async
   * @param {number} surveyId - Survey id
   * @param {CsvCritter[]} critters - Csv critters
   * @throws {ApiGeneralError} - If length of critterbase inserts !== what was provided
   * @returns {Promise<CsvCritter[]>} Csv critters
   */
  async importCsvCritters(surveyId: number, critters: CsvCritter[]) {
    const critterIds = critters.map((critter) => critter.critter_id);

    // Add critters to Critterbase
    const bulkResponse = await this.critterbaseService.bulkCreate({ critters });

    if (bulkResponse.created.critters !== critterIds.length) {
      defaultLog.error({
        label: 'import csv critters',
        message: 'failed to fully import all critters into critterbase',
        critter_ids: critterIds
      });

      throw new ApiGeneralError('Unable to fully import critters from CSV', [
        'surveyCritterService->importCsvCritters',
        'critterbase bulk create response count !== critterIds.length'
      ]);
    }

    // Add Critters to SIMS survey
    await this.addCrittersToSurvey(surveyId, critterIds);

    return critters;
  }
}
