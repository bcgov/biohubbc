import xlsx from 'xlsx';
import { z } from 'zod';
import { IDBConnection } from '../database/db';
import {
  InsertObservation,
  ObservationGeometryRecord,
  ObservationRecord,
  ObservationRecordWithSamplingDataWithAttributes,
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
import { CritterbaseService } from './critterbase-service';
import { DBService } from './db-service';
import { SubCountService } from './subcount-service';

const defaultLog = getLogger('services/observation-service');

const observationCSVColumnValidator: IXLSXCSVValidator = {
  columnNames: ['SPECIES', 'COUNT', 'DATE', 'TIME', 'LATITUDE', 'LONGITUDE'],
  columnTypes: ['number', 'number', 'date', 'string', 'number', 'number'],
  columnAliases: {
    LATITUDE: ['LAT'],
    LONGITUDE: ['LON', 'LONG', 'LNG'],
    SPECIES: ['TAXON']
  }
};

export interface InsertUpdateObservationsWithMeasurements {
  measurements: {
    count: number | null;
    measurement_id: number;
    value: string;
  }[];
  observation: InsertObservation | UpdateObservation;
}

export const ObservationSupplementaryData = z.object({
  observationCount: z.number(),
  measurementColumns: z
    .array(
      z.object({
        id: z.string(),
        name: z.string()
      })
    )
    .nullable()
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
  async insertUpdateSurveyObservationsWithMeasurements(
    surveyId: number,
    observations: InsertUpdateObservationsWithMeasurements[]
  ): Promise<ObservationRecord[]> {
    const subCountService = new SubCountService(this.connection);
    const finalResults: ObservationRecord[] = [];
    // insert/ update observation data
    // check for measurements
    //  add them to critter base
    //  remove old sub count rows
    //  add observation subcount
    //  add attribute subcount
    for (const data of observations) {
      const results = await this.observationRepository.insertUpdateSurveyObservations(surveyId, [data.observation]);
      finalResults.push(results[0]);
      const surveyObservationId = results[0].survey_observation_id;

      // need to add these to critter base
      if (data.measurements.length > 0) {
        const critterBaseService = new CritterbaseService({
          keycloak_guid: this.connection.systemUserGUID(),
          username: this.connection.systemUserIdentifier()
        });

        const ids = data.measurements.map((item) => item.measurement_id);
        const eventId = await critterBaseService.addAttributeRecords(ids);

        // delete old observation and attribute subcounts
        await subCountService.deleteObservationsAndAttributeSubCounts([surveyObservationId]);

        // insert observation subcount
        const observationSubCount = await subCountService.insertObservationSubCount({
          survey_observation_id: surveyObservationId,
          subcount: data.observation.count
        });

        // insert subcount attribute
        await subCountService.insertSubCountAttribute({
          observation_subcount_id: observationSubCount.observation_subcount_id,
          critterbase_event_id: eventId
        });
      }
    }
    return finalResults;
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
  async getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<{
    surveyObservations: ObservationRecordWithSamplingDataWithAttributes[];
    supplementaryObservationData: ObservationSupplementaryData;
  }> {
    const service = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });
    const surveyObservations = await this.observationRepository.getSurveyObservationsWithSamplingData(
      surveyId,
      pagination
    );

    // fetch data from critterbase
    const eventIds = surveyObservations
      .flatMap((item) => item.observation_subcount_attributes)
      .filter((item) => item !== null);

    await service.getMeasurementsForEventIds(eventIds);

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
    const service = new SubCountService(this.connection);
    const observationCount = await this.observationRepository.getSurveyObservationCount(surveyId);
    const measurementColumns = await service.getMeasurementColumnNamesForSurvey(surveyId);

    return { observationCount, measurementColumns };
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
      throw new Error('Failed to process file for importing observations. Invalid CSV file.');
    }

    // Get the worksheet row objects
    const worksheetRowObjects = getWorksheetRowObjects(xlsxWorksheets['Sheet1']);

    // Step 5. Merge all the table rows into an array of ObservationInsert[]
    const insertRows: InsertObservation[] = worksheetRowObjects.map((row) => ({
      survey_id: surveyId,
      wldtaxonomic_units_id: row['SPECIES'],
      survey_sample_site_id: null,
      survey_sample_method_id: null,
      survey_sample_period_id: null,
      latitude: row['LATITUDE'] ?? row['LAT'],
      longitude: row['LONGITUDE'] ?? row['LON'] ?? row['LONG'] ?? row['LNG'],
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
    // Remove any existing sub count data before removing observations
    const service = new SubCountService(this.connection);
    await service.deleteObservationsAndAttributeSubCounts(observationIds);
    return this.observationRepository.deleteObservationsByIds(observationIds);
  }
}
