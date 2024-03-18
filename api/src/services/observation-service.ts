import xlsx from 'xlsx';
import { IDBConnection } from '../database/db';
import { ApiGeneralError } from '../errors/api-error';
import {
  InsertObservation,
  ObservationGeometryRecord,
  ObservationRecord,
  ObservationRecordWithSamplingDataWithEventsWithAttributes,
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
import { CBMeasurementType, CritterbaseService } from './critterbase-service';
import { DBService } from './db-service';
import { PlatformService } from './platform-service';
import { SubCountService } from './subcount-service';

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

export type InsertUpdateObservationsWithMeasurements = {
  standardColumns: InsertObservation | UpdateObservation;
  measurementColumns: {
    id: string;
    measurement_id: number;
    value: string | number;
  }[];
};

export type ObservationSupplementaryData = {
  observationCount: number;
  measurementColumns: CBMeasurementType[];
};

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
   * Upserts the given observation records and their associated measurements.
   *
   * @param {number} surveyId
   * @param {((Observation | ObservationRecord)[])} observations
   * @return {*}  {Promise<void>}
   * @memberof ObservationService
   */
  async insertUpdateSurveyObservationsWithMeasurements(
    surveyId: number,
    observations: InsertUpdateObservationsWithMeasurements[]
  ): Promise<void> {
    const subCountService = new SubCountService(this.connection);

    for (const observation of observations) {
      // Upsert observation standard columns
      const upsertedObservationRecord = await this.observationRepository.insertUpdateSurveyObservations(
        surveyId,
        await this._attachItisScientificName([observation.standardColumns])
      );

      const surveyObservationId = upsertedObservationRecord[0].survey_observation_id;

      // Delete old observation subcount records (subcounts, events, and critters)
      await subCountService.deleteObservationSubCountRecords(surveyId, [surveyObservationId]);

      // Insert observation subcount record (event)
      const observationSubCountRecord = await subCountService.insertObservationSubCount({
        survey_observation_id: surveyObservationId,
        subcount: observation.standardColumns.count
      });

      // Persist measurement records to Critterbase
      if (observation.measurementColumns.length) {
        const critterBaseService = new CritterbaseService({
          keycloak_guid: this.connection.systemUserGUID(),
          username: this.connection.systemUserIdentifier()
        });

        const insertMeasurementResponse = await critterBaseService.insertMeasurementRecords(
          observation.measurementColumns
        );

        // Insert observation subcount_event record to track the measurements persisted by Critterbase
        await subCountService.insertSubCountEvent({
          observation_subcount_id: observationSubCountRecord.observation_subcount_id,
          critterbase_event_id: insertMeasurementResponse.eventId
        });
      }
    }
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
   * @return {*}  {Promise<{
   *     surveyObservations: ObservationRecordWithSamplingDataWithEventsWithAttributes[];
   *     supplementaryObservationData: ObservationSupplementaryData;
   *   }>}
   * @memberof ObservationService
   */
  async getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<{
    surveyObservations: ObservationRecordWithSamplingDataWithEventsWithAttributes[];
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

    // Get all event ids from all survey observations
    const eventIds = surveyObservations.flatMap((item) => item.observation_subcount_events).filter(Boolean) as string[];

    // Fetch all measurement values for the given event ids
    const measurementValues = await service.getMeasurementValuesForEventIds(eventIds);

    // Assign matching measurement records to their respective observation records
    const surveyObservationsWithAttributes = surveyObservations.map((observation) => {
      const matchingMeasurementValues = measurementValues.filter((measurement) =>
        observation.observation_subcount_events?.includes(measurement.event_id)
      );

      return { ...observation, observation_subcount_attributes: matchingMeasurementValues };
    });

    const supplementaryObservationData = await this.getSurveyObservationsSupplementaryData(surveyId);

    return { surveyObservations: surveyObservationsWithAttributes, supplementaryObservationData };
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

    const measurementTypeDefinitions = await service.getMeasurementTypeDefinitionsForSurvey(surveyId);

    return { observationCount, measurementColumns: measurementTypeDefinitions };
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
      itis_tsn: row['ITIS_TSN'] ?? row['TSN'] ?? row['TAXON'] ?? row['SPECIES'],
      itis_scientific_name: null,
      survey_sample_site_id: null,
      survey_sample_method_id: null,
      survey_sample_period_id: null,
      latitude: row['LATITUDE'] ?? row['LAT'],
      longitude: row['LONGITUDE'] ?? row['LON'] ?? row['LONG'] ?? row['LNG'],
      count: row['COUNT'],
      observation_time: row['TIME'],
      observation_date: row['DATE']
    }));

    // Step 7. Insert new rows and return them
    return this.observationRepository.insertUpdateSurveyObservations(
      surveyId,
      await this._attachItisScientificName(insertRows)
    );
  }

  /**
   * Maps over an array of inserted/updated observation records in order to update its scientific
   * name to match its ITIS TSN.
   *
   * @template RecordWithTaxonFields
   * @param {RecordWithTaxonFields[]} records
   * @return {*}  {Promise<RecordWithTaxonFields[]>}
   * @memberof ObservationServiceF
   */
  async _attachItisScientificName<
    RecordWithTaxonFields extends Pick<ObservationRecord, 'itis_tsn' | 'itis_scientific_name'>
  >(recordsToPatch: RecordWithTaxonFields[]): Promise<RecordWithTaxonFields[]> {
    defaultLog.debug({ label: '_attachItisScientificName' });

    const platformService = new PlatformService(this.connection);

    const uniqueTsnSet: Set<number> = recordsToPatch.reduce((acc: Set<number>, record: RecordWithTaxonFields) => {
      if (record.itis_tsn) {
        acc.add(record.itis_tsn);
      }
      return acc;
    }, new Set<number>([]));

    const taxonomyResponse = await platformService.getTaxonomyByTsns(Array.from(uniqueTsnSet)).catch((error) => {
      throw new ApiGeneralError(
        `Failed to fetch scientific names for observation records. The request to BioHub failed: ${error}`
      );
    });

    return recordsToPatch.map((recordToPatch: RecordWithTaxonFields) => {
      recordToPatch.itis_scientific_name =
        taxonomyResponse.find((taxonItem) => Number(taxonItem.tsn) === recordToPatch.itis_tsn)?.scientificName ?? null;

      return recordToPatch;
    });
  }

  /**
   * Deletes all survey_observation records for the given survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} observationIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async deleteObservationsByIds(surveyId: number, observationIds: number[]): Promise<number> {
    // Remove any existing child subcount records (observation_subcount, subcount_event, subcount_critter) before
    // deleteing survey_observation records
    const service = new SubCountService(this.connection);
    await service.deleteObservationSubCountRecords(surveyId, observationIds);

    // Delete survey_observation records
    return this.observationRepository.deleteObservationsByIds(surveyId, observationIds);
  }
}
