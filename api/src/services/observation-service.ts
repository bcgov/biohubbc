import xlsx from 'xlsx';
import { IDBConnection } from '../database/db';
import { ApiGeneralError } from '../errors/api-error';
import {
  InsertObservation,
  ObservationGeometryRecord,
  ObservationRecord,
  ObservationRecordWithSamplingAndSubcountData,
  ObservationRepository,
  ObservationSubmissionRecord,
  UpdateObservation
} from '../repositories/observation-repository';
import {
  InsertObservationSubCountQualitativeMeasurementRecord,
  InsertObservationSubCountQuantitativeMeasurementRecord
} from '../repositories/observation-subcount-measurement-repository';
import { generateS3FileKey, getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { parseS3File } from '../utils/media/media-utils';
import {
  constructWorksheets,
  constructXLSXWorkbook,
  findMeasurementFromTsnMeasurements,
  getCBMeasurementsFromWorksheet,
  getMeasurementColumnNameFromWorksheet,
  getWorksheetRowObjects,
  isMeasurementCBQualitativeTypeDefinition,
  IXLSXCSVValidator,
  validateCsvFile,
  validateCsvMeasurementColumns,
  validateWorksheetColumnTypes,
  validateWorksheetHeaders
} from '../utils/xlsx-utils/worksheet-utils';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from './critterbase-service';
import { DBService } from './db-service';
import { ObservationSubCountMeasurementService } from './observation-subcount-measurement-service';
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

export interface InsertSubCount {
  observation_subcount_id: number | null;
  subcount: number;
  qualitative: {
    measurement_id: string;
    measurement_option_id: string;
  }[];
  quantitative: {
    measurement_id: string;
    measurement_value: number;
  }[];
}

export type InsertUpdateObservationsWithMeasurements = {
  standardColumns: InsertObservation | UpdateObservation;
  subcounts: InsertSubCount[];
};

export type ObservationCountSupplementaryData = {
  observationCount: number;
};

export type ObservationMeasurementSupplementaryData = {
  qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
  quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
};

export type AllObservationSupplementaryData = ObservationCountSupplementaryData &
  ObservationMeasurementSupplementaryData;

export class ObservationService extends DBService {
  observationRepository: ObservationRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.observationRepository = new ObservationRepository(connection);
  }

  /**
   * Validates the given CSV file against the given column validator
   *
   * @param {xlsx.WorkSheet} xlsxWorksheets
   * @param {IXLSXCSVValidator} columnValidator
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
   * @param {InsertUpdateObservationsWithMeasurements[]} observations
   * @return {*}  {Promise<void>}
   * @memberof ObservationService
   */
  async insertUpdateSurveyObservationsWithMeasurements(
    surveyId: number,
    observations: InsertUpdateObservationsWithMeasurements[]
  ): Promise<void> {
    const subCountService = new SubCountService(this.connection);
    const measurementService = new ObservationSubCountMeasurementService(this.connection);
    for (const observation of observations) {
      // Upsert observation standard columns
      const upsertedObservationRecord = await this.observationRepository.insertUpdateSurveyObservations(
        surveyId,
        await this._attachItisScientificName([observation.standardColumns])
      );

      const surveyObservationId = upsertedObservationRecord[0].survey_observation_id;

      // TODO: Update process to fetch and find differences between incoming and existing data to only add, update or delete records as needed
      // Delete old observation subcount records (critters, measurements and subcounts)
      await subCountService.deleteObservationSubCountRecords(surveyId, [surveyObservationId]);

      // Insert observation subcount record (event)
      const observationSubCountRecord = await subCountService.insertObservationSubCount({
        survey_observation_id: surveyObservationId,
        subcount: observation.standardColumns.count
      });

      // Process currently treats all incoming data as source of truth, deletes all
      if (observation.subcounts.length) {
        for (const subcount of observation.subcounts) {
          // TODO: Update process to fetch and find differences between incoming and existing data to only add, update or delete records as needed
          if (subcount.qualitative.length) {
            const qualitativeData: InsertObservationSubCountQualitativeMeasurementRecord[] = subcount.qualitative.map(
              (item) => ({
                observation_subcount_id: observationSubCountRecord.observation_subcount_id,
                critterbase_taxon_measurement_id: item.measurement_id,
                critterbase_measurement_qualitative_option_id: item.measurement_option_id
              })
            );
            await measurementService.insertObservationSubCountQualitativeMeasurement(qualitativeData);
          }

          if (subcount.quantitative.length) {
            subcount.quantitative;
            const quantitativeData: InsertObservationSubCountQuantitativeMeasurementRecord[] = subcount.quantitative.map(
              (item) => ({
                observation_subcount_id: observationSubCountRecord.observation_subcount_id,
                critterbase_taxon_measurement_id: item.measurement_id,
                value: item.measurement_value
              })
            );
            await measurementService.insertObservationSubCountQuantitativeMeasurement(quantitativeData);
          }
        }
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
   * @param {number} surveyObservationId
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationById(surveyId: number, surveyObservationId: number): Promise<ObservationRecord> {
    return this.observationRepository.getSurveyObservationById(surveyId, surveyObservationId);
  }

  /**
   * Retrieves all observation records for the given survey along with supplementary data
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<{
   *     surveyObservations: ObservationRecordWithSamplingAndSubcountData[];
   *     supplementaryObservationData: AllObservationSupplementaryData;
   *   }>}
   * @memberof ObservationService
   */
  async getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<{
    surveyObservations: ObservationRecordWithSamplingAndSubcountData[];
    supplementaryObservationData: AllObservationSupplementaryData;
  }> {
    const surveyObservations = await this.observationRepository.getSurveyObservationsWithSamplingDataWithAttributesData(
      surveyId,
      pagination
    );

    // Get supplementary observation data
    const observationCount = await this.observationRepository.getSurveyObservationCount(surveyId);
    const subCountService = new SubCountService(this.connection);
    const measurementTypeDefinitions = await subCountService.getMeasurementTypeDefinitionsForSurvey(surveyId);

    return {
      surveyObservations: surveyObservations,
      supplementaryObservationData: {
        observationCount,
        qualitative_measurements: measurementTypeDefinitions.qualitative_measurements,
        quantitative_measurements: measurementTypeDefinitions.quantitative_measurements
      }
    };
  }

  /**
   * Gets a set of GeoJson geometries representing the set of all lat/long points for the
   * given survey's observations.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<{
   *     surveyObservationsGeometry: ObservationGeometryRecord[];
   *     supplementaryObservationData: ObservationCountSupplementaryData;
   *   }>}
   * @memberof ObservationService
   */
  async getSurveyObservationsGeometryWithSupplementaryData(
    surveyId: number
  ): Promise<{
    surveyObservationsGeometry: ObservationGeometryRecord[];
    supplementaryObservationData: ObservationCountSupplementaryData;
  }> {
    const surveyObservationsGeometry = await this.observationRepository.getSurveyObservationsGeometry(surveyId);

    // Get supplementary observation data
    const observationCount = await this.observationRepository.getSurveyObservationCount(surveyId);

    return { surveyObservationsGeometry, supplementaryObservationData: { observationCount } };
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
   * @param {number} surveyId
   * @param {number} submissionId
   * @return {*}  {Promise<ObservationSubmissionRecord>}
   * @memberof ObservationService
   */
  async getObservationSubmissionById(surveyId: number, submissionId: number): Promise<ObservationSubmissionRecord> {
    return this.observationRepository.getObservationSubmissionById(surveyId, submissionId);
  }

  /**
   * Retrieves observation records count for the given survey and sample site ids
   *
   * @param {number} surveyId
   * @param {number[]} sampleSiteIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationService
   */
  async getObservationsCountBySampleSiteIds(surveyId: number, sampleSiteIds: number[]): Promise<number> {
    return this.observationRepository.getObservationsCountBySampleSiteIds(surveyId, sampleSiteIds);
  }

  /**
   * Retrieves observation records count for the given survey and sample method ids
   *
   * @param {number[]} sampleMethodIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationService
   */
  async getObservationsCountBySampleMethodIds(sampleMethodIds: number[]): Promise<number> {
    return this.observationRepository.getObservationsCountBySampleMethodIds(sampleMethodIds);
  }

  /**
   * Retrieves observation records count for the given survey and sample period ids
   *
   * @param {number[]} samplePeriodIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationService
   */
  async getObservationsCountBySamplePeriodIds(samplePeriodIds: number[]): Promise<number> {
    return this.observationRepository.getObservationsCountBySamplePeriodIds(samplePeriodIds);
  }

  /**
   * Processes a observation upload submission. This method receives an ID belonging to an
   * observation submission, gets the CSV file associated with the submission, and appends
   * all of the records in the CSV file to the observations for the survey. If the CSV
   * file fails validation, this method fails.
   *
   * @param {number} surveyId
   * @param {number} submissionId
   * @return {*}  {Promise<void>}
   * @memberof ObservationService
   */
  async processObservationCsvSubmission(surveyId: number, submissionId: number): Promise<void> {
    defaultLog.debug({ label: 'processObservationCsvSubmission', submissionId });

    // Step 1. Retrieve the observation submission record
    const submission = await this.getObservationSubmissionById(surveyId, submissionId);

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

    // Step 5. Validate Measurement data in CSV file
    const service = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });

    // reach out to critterbase for TSN Measurement data
    const tsnMeasurements = await getCBMeasurementsFromWorksheet(xlsxWorksheets, service);

    // collection additional measurement columns
    const measurementColumns = getMeasurementColumnNameFromWorksheet(xlsxWorksheets, observationCSVColumnValidator);

    // Get the worksheet row objects
    const worksheetRowObjects = getWorksheetRowObjects(xlsxWorksheets['Sheet1']);
    // Validate measurement data against
    if (!validateCsvMeasurementColumns(worksheetRowObjects, measurementColumns, tsnMeasurements)) {
      throw new Error('Failed to process file for importing observations. Measurement column validator failed.');
    }

    // Step 6. Merge all the table rows into an array of InsertUpdateObservationsWithMeasurements[]
    const newRowData: InsertUpdateObservationsWithMeasurements[] = worksheetRowObjects.map((row) => {
      const newSubcount: InsertSubCount = {
        observation_subcount_id: null,
        subcount: row['COUNT'],
        qualitative: [],
        quantitative: []
      };
      measurementColumns.forEach((mColumn) => {
        // Ignore blank columns
        if (Boolean(mColumn)) {
          const measurement = findMeasurementFromTsnMeasurements(
            String(row['ITIS_TSN'] ?? row['TSN'] ?? row['TAXON'] ?? row['SPECIES']),
            mColumn,
            tsnMeasurements
          );

          const rowData = row[mColumn];

          console.log(`Column: ${measurement?.measurement_name} Value: ${rowData}`);
          // Ignore empty rows
          if (Boolean(rowData)) {
            if (measurement) {
              // if measurement is qualitative, find the option uuid
              if (isMeasurementCBQualitativeTypeDefinition(measurement)) {
                console.log(`Qualitative Measurement!`);
                const foundOption = measurement.options.find(
                  (option) =>
                    option.option_label.toLowerCase() === String(rowData).toLowerCase() ||
                    option.option_value === Number(rowData)
                );
                if (foundOption) {
                  console.log(`Found the option`);
                  newSubcount.qualitative.push({
                    measurement_id: measurement.taxon_measurement_id,
                    measurement_option_id: foundOption.qualitative_option_id
                  });
                }
              } else {
                console.log(`Quantitative Measurement!`);
                newSubcount.quantitative.push({
                  measurement_id: measurement.taxon_measurement_id,
                  measurement_value: Number(rowData)
                });
              }
            }
          }
        }
      });

      return {
        standardColumns: {
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
        },
        subcounts: [newSubcount]
      };
    });

    // Step 7. Insert new rows and return them
    console.log(newRowData);
    await this.insertUpdateSurveyObservationsWithMeasurements(surveyId, newRowData);
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
