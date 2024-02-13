import xlsx from 'xlsx';
import { z } from 'zod';
import { IDBConnection } from '../database/db';
import {
  InsertObservation,
  ObservationGeometryRecord,
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
  IXLSXCSVValidator,
  validateCsvFile,
  validateWorksheetColumnTypes,
  validateWorksheetHeaders
} from '../utils/xlsx-utils/worksheet-utils';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { DBService } from './db-service';
import { PlatformService } from './platform-service';
import { ApiGeneralError } from '../errors/api-error';

const defaultLog = getLogger('services/observation-service');

const observationCSVColumnValidator: IXLSXCSVValidator = {
  columnNames: ['ITIS_TSN', 'COUNT', 'DATE', 'TIME', 'LATITUDE', 'LONGITUDE'],
  columnTypes: ['number', 'number', 'date', 'string', 'number', 'number'],
  columnAliases: {
    ITIS_TSN: ['TAXON', 'SPECIES', 'TSN'],
    LATITUDE: ['LAT'],
    LONGITUDE: ['LON', 'LONG', 'LNG']
  }
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
    if (!validateWorksheetHeaders(xlsxWorksheets['Sheet1'], columnValidator)) {
      return false;
    }

    // Validate the worksheet column types
    if (!validateWorksheetColumnTypes(xlsxWorksheets['Sheet1'], columnValidator)) {
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
   * Performs an upsert for all observation records belonging to the given survey, then
   * returns the updated rows.
   *
   * @param {number} surveyId
   * @param {((Observation | ObservationRecord)[])} observations
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationService
   */
  async insertUpdateSurveyObservations(
    surveyId: number,
    observations: (InsertObservation | UpdateObservation)[]
  ): Promise<ObservationRecord[]> {
    return this.observationRepository.insertUpdateSurveyObservations(surveyId, await this._attachItisScientificName(observations));
  }

  /**
   * Retrieves all observation records for the given survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async getAllSurveyObservations(surveyId: number): Promise<ObservationRecord[]> {
    return this.observationRepository.getAllSurveyObservations(surveyId);
  }

  /**
   * Retrieves a single observation records by ID
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationById(surveyObservationId: number): Promise<ObservationRecord> {
    return this.observationRepository.getSurveyObservationById(surveyObservationId);
  }

  /**
   * Retrieves all observation records for the given survey along with supplementary data
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<{ surveyObservations: ObservationRecord[]; supplementaryObservationData: ObservationSupplementaryData }>}
   * @memberof ObservationService
   */
  async getSurveyObservationsWithSupplementaryAndSamplingData(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<{ surveyObservations: ObservationRecord[]; supplementaryObservationData: ObservationSupplementaryData }> {
    const surveyObservations = await this.observationRepository.getSurveyObservationsWithSamplingData(
      surveyId,
      pagination
    );
    const supplementaryObservationData = await this.getSurveyObservationsSupplementaryData(surveyId);

    return { surveyObservations, supplementaryObservationData };
  }

  /**
   * Gets a set of GeoJson geometries representing the set of all lat/long points for the
   * given survey's observations.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<{
   *     surveyObservationsGeometry: ObservationGeometryRecord[];
   *     supplementaryObservationData: ObservationSupplementaryData;
   *   }>}
   * @memberof ObservationService
   */
  async getSurveyObservationsGeometryWithSupplementaryData(
    surveyId: number
  ): Promise<{
    surveyObservationsGeometry: ObservationGeometryRecord[];
    supplementaryObservationData: ObservationSupplementaryData;
  }> {
    const surveyObservationsGeometry = await this.observationRepository.getSurveyObservationsGeometry(surveyId);
    const supplementaryObservationData = await this.getSurveyObservationsSupplementaryData(surveyId);

    return { surveyObservationsGeometry, supplementaryObservationData };
  }

  /**
   * Retrieves all supplementary data for the given survey's observations
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ObservationSupplementaryData>}
   * @memberof ObservationService
   */
  async getSurveyObservationsSupplementaryData(surveyId: number): Promise<ObservationSupplementaryData> {
    const observationCount = await this.observationRepository.getSurveyObservationCount(surveyId);

    return { observationCount };
  }

  /**
   * Retrieves the count of survey observations for the given survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationCount(surveyId: number): Promise<number> {
    return this.observationRepository.getSurveyObservationCount(surveyId);
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
   * Retrieves all observation records for the given survey and sample site id
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
   * Retrieves observation records count for the given survey and sample site ids
   *
   * @param {number} surveyId
   * @param {number[]} sampleSiteIds
   * @return {*}  {Promise<{ observationCount: number }>}
   * @memberof ObservationService
   */
  async getObservationsCountBySampleSiteIds(
    surveyId: number,
    sampleSiteIds: number[]
  ): Promise<{ observationCount: number }> {
    return this.observationRepository.getObservationsCountBySampleSiteIds(surveyId, sampleSiteIds);
  }

  /**
   * Retrieves observation records count for the given survey and sample method ids
   *
   * @param {number} sampleMethodId
   * @return {*}  {Promise<{ observationCount: number }>}
   * @memberof ObservationService
   */
  async getObservationsCountBySampleMethodId(sampleMethodId: number): Promise<{ observationCount: number }> {
    return this.observationRepository.getObservationsCountBySampleMethodId(sampleMethodId);
  }

  /**
   * Retrieves observation records count for the given survey and sample period ids
   *
   * @param {number} samplePeriodId
   * @return {*}  {Promise<{ observationCount: number }>}
   * @memberof ObservationService
   */
  async getObservationsCountBySamplePeriodId(samplePeriodId: number): Promise<{ observationCount: number }> {
    return this.observationRepository.getObservationsCountBySamplePeriodId(samplePeriodId);
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

    if (!validateCsvFile(xlsxWorksheets, observationCSVColumnValidator)) {
      throw new Error('Failed to process file for importing observations. Column validator failed.');
    }

    // Get the worksheet row objects
    const worksheetRowObjects = getWorksheetRowObjects(xlsxWorksheets['Sheet1']);

    // Step 5. Merge all the table rows into an array of ObservationInsert[]
    const insertRows: InsertObservation[] = worksheetRowObjects.map((row) => ({
      survey_id: surveyId,
      survey_sample_site_id: null,
      survey_sample_method_id: null,
      survey_sample_period_id: null,
      latitude: row['LATITUDE'] ?? row['LAT'],
      longitude: row['LONGITUDE'] ?? row['LON'] ?? row['LONG'] ?? row['LNG'],
      count: row['COUNT'],
      observation_time: row['TIME'],
      observation_date: row['DATE'],
      itis_tsn: row['ITIS_TSN'],
      itis_scientific_name: null
    }));

    // Step 7. Insert new rows and return them
    return this.observationRepository.insertUpdateSurveyObservations(surveyId, await this._attachItisScientificName(insertRows));
  }

  /**
   * Maps over an array of inserted/updated observation records in order to update its scientific
   * name to match its ITIS TSN.
   *
   * @param {InsertObservation[]} records
   * @return {*}  {Promise<InsertObservation[]>}
   * @memberof ObservationService
   */
  async _attachItisScientificName(records: (InsertObservation | UpdateObservation)[]): Promise<(InsertObservation | UpdateObservation)[]> {
    defaultLog.debug({ label: '_attachItisScientificName' });

    const platformService = new PlatformService(this.connection);

    const uniqueTsnSet: Set<number> = records.reduce(
      (acc: Set<number>, record: InsertObservation | UpdateObservation) => {
        if (record.itis_tsn) {
          acc.add(record.itis_tsn as number);
        }
        return acc;
      },
      new Set<number>([])
    );

    const taxonomyResponse = await platformService.getTaxonomyByTsns(Array.from(uniqueTsnSet)).catch((error) => {
      throw new ApiGeneralError(`Failed to fetch scientific names for observation records. The request to ITIS failed: ${error}`);
    });

    return records.map((record: InsertObservation | UpdateObservation) => {
      record.itis_scientific_name = taxonomyResponse.find((taxonomy) => Number(taxonomy.tsn) === record.itis_tsn)
        ?.scientificName ?? null;

      if (!record.itis_scientific_name) {
        throw new ApiGeneralError(`Failed to fetch scientific names for observation records. A scientific name could not be found for the given ITIS TSN: ${record.itis_tsn}`);
      }

      return record;
    });
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
