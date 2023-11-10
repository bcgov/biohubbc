import xlsx from 'xlsx';
import { z } from 'zod';
import { IDBConnection } from '../database/db';
import {
  InsertObservation,
  ObservationRecord,
  ObservationRepository,
  ObservationSubmissionRecord,
  UpdateObservation
} from '../repositories/observation-repository';
import { generateS3FileKey, getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { parseS3File } from '../utils/media/media-utils';
import {
  constructWorksheets,
  constructXLSXWorkbook,
  getWorksheetRowObjects,
  validateWorksheetColumnTypes,
  validateWorksheetHeaders
} from '../utils/xlsx-utils/worksheet-utils';
import { DBService } from './db-service';

const defaultLog = getLogger('services/observation-service');

export interface IXLSXCSVValidator {
  columnNames: string[];
  columnTypes: string[];
}

const observationCSVColumnValidator = {
  columnNames: ['SPECIES_TAXONOMIC_ID', 'COUNT', 'DATE', 'TIME', 'LATITUDE', 'LONGITUDE'],
  columnTypes: ['number', 'number', 'date', 'string', 'number', 'number']
};

export const ObservationSupplementaryData = z.object({
  observationCount: z.number()
});

export type ObservationSupplementaryData = z.infer<typeof ObservationSupplementaryData>;

export class ObservationService extends DBService {
  observationRepository: ObservationRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.observationRepository = new ObservationRepository(connection);
  }

  /**
   * Validates the given CSV file against the given column validator
   *
   * @param {MediaFile} file
   * @return {*}  {boolean}
   * @memberof ObservationService
   */
  validateCsvFile(xlsxWorksheets: xlsx.WorkSheet, columnValidator: IXLSXCSVValidator): boolean {
    // Validate the worksheet headers
    if (!validateWorksheetHeaders(xlsxWorksheets['Sheet1'], columnValidator.columnNames)) {
      return false;
    }

    // Validate the worksheet column types
    if (!validateWorksheetColumnTypes(xlsxWorksheets['Sheet1'], columnValidator.columnTypes)) {
      return false;
    }

    return true;
  }

  /**
   * Performs an upsert for all observation records belonging to the given survey, while removing
   * any records associated for the survey that aren't included in the given records, then
   * returns the updated rows
   *
   * @param {number} surveyId
   * @param {((Observation | ObservationRecord)[])} observations
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationService
   */
  async insertUpdateDeleteSurveyObservations(
    surveyId: number,
    observations: (InsertObservation | UpdateObservation)[]
  ): Promise<ObservationRecord[]> {
    const retainedObservationIds = observations
      .filter((observation): observation is UpdateObservation => {
        return 'survey_observation_id' in observation && Boolean(observation.survey_observation_id);
      })
      .map((observation) => observation.survey_observation_id);

    await this.observationRepository.deleteObservationsNotInArray(surveyId, retainedObservationIds);

    return this.observationRepository.insertUpdateSurveyObservations(surveyId, observations);
  }

  /**
   * Retrieves all observation records for the given survey along with supplementary data
   *
   * @param {number} surveyId
   * @return {*}  {Promise<{ surveyObservations: ObservationRecord[]; supplementaryObservationData: ObservationSupplementaryData }>}
   * @memberof ObservationService
   */
  async getSurveyObservationsWithSupplementaryData(
    surveyId: number
  ): Promise<{ surveyObservations: ObservationRecord[]; supplementaryObservationData: ObservationSupplementaryData }> {
    const surveyObservations = await this.observationRepository.getSurveyObservations(surveyId);
    const supplementaryObservationData = await this.getSurveyObservationsSupplementaryData(surveyId);

    return { surveyObservations, supplementaryObservationData };
  }

  /**
   * Retrieves all supplementary data for the given survey's observations
   *
   * @param {number} surveyId
   * @return {*}  {Promise<{ surveyObservations: ObservationRecord[]; supplementaryObservationData: ObservationSupplementaryData }>}
   * @memberof ObservationService
   */
  async getSurveyObservationsSupplementaryData(surveyId: number): Promise<ObservationSupplementaryData> {
    const observationCount = await this.observationRepository.getSurveyObservationCount(surveyId);

    return { observationCount };
  }

  /**
   * Inserts a survey observation submission record into the database and returns the key
   *
   * @param {Express.Multer.File} file
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<{ key: string }>}
   * @memberof ObservationService
   */
  async insertSurveyObservationSubmission(
    file: Express.Multer.File,
    projectId: number,
    surveyId: number
  ): Promise<{ submission_id: number; key: string }> {
    const submissionId = await this.observationRepository.getNextSubmissionId();

    const key = generateS3FileKey({
      projectId,
      surveyId,
      submissionId,
      fileName: file.originalname
    });

    const insertResult = await this.observationRepository.insertSurveyObservationSubmission(
      submissionId,
      key,
      surveyId,
      file.originalname
    );

    return { submission_id: insertResult.submission_id, key };
  }

  /**
   * Retrieves the observation submission record by the given submission ID.
   *
   * @param {number} submissionId
   * @return {*}  {Promise<ObservationSubmissionRecord>}
   * @memberof ObservationService
   */
  async getObservationSubmissionById(submissionId: number): Promise<ObservationSubmissionRecord> {
    return this.observationRepository.getObservationSubmissionById(submissionId);
  }

  /**
   * Retrieves all observation records for the given survey and sample site ids
   *
   * @param {number} surveyId
   * @param {number} sampleSiteId
   * @return {*}  {Promise<{ observationCount: number }>}
   * @memberof ObservationService
   */
  async getObservationsCountBySampleSiteId(
    surveyId: number,
    sampleSiteId: number
  ): Promise<{ observationCount: number }> {
    return this.observationRepository.getObservationsCountBySampleSiteId(surveyId, sampleSiteId);
  }

  /**
   * Processes a observation upload submission. This method receives an ID belonging to an
   * observation submission, gets the CSV file associated with the submission, and appends
   * all of the records in the CSV file to the observations for the survey. If the CSV
   * file fails validation, this method fails.
   *
   * @param {number} submissionId
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationService
   */
  async processObservationCsvSubmission(submissionId: number): Promise<ObservationRecord[]> {
    defaultLog.debug({ label: 'processObservationCsvSubmission', submissionId });

    // Step 1. Retrieve the observation submission record
    const submission = await this.getObservationSubmissionById(submissionId);
    const surveyId = submission.survey_id;

    // Step 2. Retrieve the S3 object containing the uploaded CSV file
    const s3Object = await getFileFromS3(submission.key);

    // Step 3. Get the contents of the S3 object
    const mediaFile = parseS3File(s3Object);

    // Step 4. Validate the CSV file
    if (mediaFile.mimetype !== 'text/csv') {
      throw new Error('Failed to process file for importing observations. Invalid CSV file.');
    }

    // Construct the XLSX workbook
    const xlsxWorkBook = constructXLSXWorkbook(mediaFile);

    // Construct the worksheets
    const xlsxWorksheets = constructWorksheets(xlsxWorkBook);

    if (!this.validateCsvFile(xlsxWorksheets, observationCSVColumnValidator)) {
      throw new Error('Failed to process file for importing observations. Invalid CSV file.');
    }

    // Get the worksheet row objects
    const worksheetRowObjects = getWorksheetRowObjects(xlsxWorksheets['Sheet1']);

    // Step 5. Merge all the table rows into an array of ObservationInsert[]
    const insertRows: InsertObservation[] = worksheetRowObjects.map((row) => ({
      survey_id: surveyId,
      wldtaxonomic_units_id: row['SPECIES_TAXONOMIC_ID'],
      survey_sample_site_id: null,
      survey_sample_method_id: null,
      survey_sample_period_id: null,
      latitude: row['LATITUDE'],
      longitude: row['LONGITUDE'],
      count: row['COUNT'],
      observation_time: row['TIME'],
      observation_date: row['DATE']
    }));

    // Step 6. Insert new rows and return them
    return this.observationRepository.insertUpdateSurveyObservations(surveyId, insertRows);
  }

  /**
   * Deletes all of the given survey observations by ID.
   *
   * @param {number[]} observationIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async deleteObservationsByIds(observationIds: number[]): Promise<number> {
    return this.observationRepository.deleteObservationsByIds(observationIds);
  }
}
