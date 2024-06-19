import { IDBConnection } from '../database/db';
import { SurveyCritterRecord, SurveyCritterRepository } from '../repositories/survey-critter-repository';
import { getCritterRowsToValidate, validateCritterRows } from '../utils/critter-xlsx-utils/critter-column-utils';
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
   * Add a critter as part of this survey. Does not create anything in the external system.
   *
   * @param {number} surveyId
   * @param {string} critterBaseCritterId
   * @return {*}  {Promise<number>}
   * @memberof SurveyCritterService
   */
  async addCritterToSurvey(surveyId: number, critterBaseCritterId: string): Promise<number> {
    return this.critterRepository.addCritterToSurvey(surveyId, critterBaseCritterId);
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

  async importCrittersFromCsv(mediaFile: MediaFile) {
    // Construct the XLSX workbook
    const xlsxWorkBook = constructXLSXWorkbook(mediaFile);

    // Get the default XLSX worksheet
    const xlsxWorksheet = getDefaultWorksheet(xlsxWorkBook);

    // Validate the standard columns in the CSV file
    if (!validateCsvFile(xlsxWorksheet, critterStandardColumnValidator)) {
      throw new Error(
        `Failed to process file for importing critters. Column validator failed. Expecting columns ${critterStandardColumnValidator.columnNames.toString()}`
      );
    }

    // Get the worksheet row objects
    const worksheetRowObjects = getWorksheetRowObjects(xlsxWorksheet);

    // Get all critter rows to validate
    const critterRowsToValidate = getCritterRowsToValidate(worksheetRowObjects);

    // Validate critter row data
    if (!validateCritterRows(critterRowsToValidate)) {
      throw new Error('Failed to process file for importing critters. Critter column validator failed.');
    }
  }
}
