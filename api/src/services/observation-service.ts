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
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../repositories/observation-subcount-environment-repository';
import {
  InsertObservationSubCountQualitativeMeasurementRecord,
  InsertObservationSubCountQuantitativeMeasurementRecord
} from '../repositories/observation-subcount-measurement-repository';
import { SamplePeriodHierarchyIds } from '../repositories/sample-period-repository';
import { generateS3FileKey, getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { parseS3File } from '../utils/media/media-utils';
import { DEFAULT_XLSX_SHEET_NAME } from '../utils/media/xlsx/xlsx-file';
import {
  constructWorksheets,
  constructXLSXWorkbook,
  findMeasurementFromTsnMeasurements,
  getCBMeasurementsFromTSN,
  getCBMeasurementTypeDefinitionsFromWorksheet,
  getMeasurementColumnNames,
  getNonStandardColumnNamesFromWorksheet,
  getWorksheetRowObjects,
  IMeasurementDataToValidate,
  isEnvironmentQualitativeTypeDefinition,
  isMeasurementCBQualitativeTypeDefinition,
  IXLSXCSVValidator,
  TsnMeasurementMap,
  validateCsvFile,
  validateCsvMeasurementColumns,
  validateMeasurements,
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
import { SamplePeriodService } from './sample-period-service';
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
  measurements_qualitative: {
    measurement_id: string;
    measurement_option_id: string;
  }[];
  measurements_quantitative: {
    measurement_id: string;
    measurement_value: number;
  }[];
  environments_qualitative: {
    environment_qualitative_option_id: number;
  }[];
  environments_quantitative: {
    environment_quantitative_id: number;
    value: number;
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
  qualitative_environments: QualitativeEnvironmentTypeDefinition[];
  quantitative_environments: QuantitativeEnvironmentTypeDefinition[];
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
    if (!validateWorksheetHeaders(xlsxWorksheets[DEFAULT_XLSX_SHEET_NAME], columnValidator)) {
      return false;
    }

    // Validate the worksheet column types
    if (!validateWorksheetColumnTypes(xlsxWorksheets[DEFAULT_XLSX_SHEET_NAME], columnValidator)) {
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
          if (subcount.measurements_qualitative.length) {
            const qualitativeData: InsertObservationSubCountQualitativeMeasurementRecord[] =
              subcount.measurements_qualitative.map((item) => ({
                observation_subcount_id: observationSubCountRecord.observation_subcount_id,
                critterbase_taxon_measurement_id: item.measurement_id,
                critterbase_measurement_qualitative_option_id: item.measurement_option_id
              }));
            await measurementService.insertObservationSubCountQualitativeMeasurement(qualitativeData);
          }

          if (subcount.measurements_quantitative.length) {
            const quantitativeData: InsertObservationSubCountQuantitativeMeasurementRecord[] =
              subcount.measurements_quantitative.map((item) => ({
                observation_subcount_id: observationSubCountRecord.observation_subcount_id,
                critterbase_taxon_measurement_id: item.measurement_id,
                value: item.measurement_value
              }));
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
    const environmentTypeDefinitions = await subCountService.getEnvironmentTypeDefinitionsForSurvey(surveyId);

    return {
      surveyObservations: surveyObservations,
      supplementaryObservationData: {
        observationCount,
        qualitative_measurements: measurementTypeDefinitions.qualitative_measurements,
        quantitative_measurements: measurementTypeDefinitions.quantitative_measurements,
        qualitative_environments: environmentTypeDefinitions.qualitative_environments,
        quantitative_environments: environmentTypeDefinitions.quantitative_environments
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
  async getSurveyObservationsGeometryWithSupplementaryData(surveyId: number): Promise<{
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
   * @param {{ surveySamplePeriodId?: number }} [options]
   * @return {*}  {Promise<void>}
   * @memberof ObservationService
   */
  async processObservationCsvSubmission(
    surveyId: number,
    submissionId: number,
    options?: { surveySamplePeriodId?: number }
  ): Promise<void> {
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

    // Fetch all measurement type definitions from Critterbase for all unique TSNs in the CSV file
    const tsnMeasurements = await getCBMeasurementTypeDefinitionsFromWorksheet(xlsxWorksheets, service);

    // Get all non-standard column names from the worksheet (ie. measurment and environment columns)
    const nonStandardColumns = getNonStandardColumnNamesFromWorksheet(xlsxWorksheets, observationCSVColumnValidator);

    // Get all measuremente columns names from the worksheet
    const measurementColumns = getMeasurementColumnNames(nonStandardColumns, tsnMeasurements);

    const environmentColumns: string[] = []; // TODO

    // Get the worksheet row objects
    const worksheetRowObjects = getWorksheetRowObjects(xlsxWorksheets[DEFAULT_XLSX_SHEET_NAME]);

    // Validate measurement data against
    if (!validateCsvMeasurementColumns(worksheetRowObjects, measurementColumns, tsnMeasurements)) {
      throw new Error('Failed to process file for importing observations. Measurement column validator failed.');
    }

    // TODO
    // if (!validateCsvEnvironmentColumns(worksheetRowObjects, environmentColumns)) {
    //   throw new Error('Failed to process file for importing observations. Environment column validator failed.');
    // }

    let samplePeriodHierarchyIds: SamplePeriodHierarchyIds;
    if (options?.surveySamplePeriodId) {
      const samplePeriodService = new SamplePeriodService(this.connection);
      samplePeriodHierarchyIds = await samplePeriodService.getSamplePeriodHierarchyIds(
        surveyId,
        options.surveySamplePeriodId
      );
    }

    // Step 6. Merge all the table rows into an array of InsertUpdateObservationsWithMeasurements[]
    const newRowData: InsertUpdateObservationsWithMeasurements[] = worksheetRowObjects.map((row) => {
      const newSubcount: InsertSubCount = {
        observation_subcount_id: null,
        subcount: row['COUNT'],
        measurements_qualitative: [],
        measurements_quantitative: [],
        environments_qualitative: [],
        environments_quantitative: []
      };

      const measurements = this._pullMeasurementsFromWorkSheetRowObject(row, measurementColumns, tsnMeasurements);
      newSubcount.measurements_qualitative = measurements.measurements_qualitative;
      newSubcount.measurements_quantitative = measurements.measurements_quantitative;

      const environments = this._pullEnvironmentsFromWorkSheetRowObject(row, environmentColumns);
      newSubcount.environments_qualitative = environments.environments_qualitative;
      newSubcount.environments_quantitative = environments.environments_quantitative;

      return {
        standardColumns: {
          survey_id: surveyId,
          itis_tsn: row['ITIS_TSN'] ?? row['TSN'] ?? row['TAXON'] ?? row['SPECIES'],
          itis_scientific_name: null,
          survey_sample_site_id: samplePeriodHierarchyIds?.survey_sample_site_id ?? null,
          survey_sample_method_id: samplePeriodHierarchyIds?.survey_sample_method_id ?? null,
          survey_sample_period_id: samplePeriodHierarchyIds?.survey_sample_period_id ?? null,
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
    await this.insertUpdateSurveyObservationsWithMeasurements(surveyId, newRowData);
  }

  /**
   * This function is a helper method for the `processObservationCsvSubmission` function. It will take row data from an uploaded CSV
   * and find and connect the CSV measurement data with proper measurement taxon ids (UUIDs) from the TsnMeasurementMap passed in.
   * Any qualitative and quantitative measurements found are returned to be inserted into the database. This function assumes that the
   * data in the CSV has already been validated.
   *
   * @param {Record<string, any>} row A worksheet row object from a CSV that was uploaded for processing
   * @param {string[]} measurementColumns A list of the measurement columns found in a CSV uploaded
   * @param {TsnMeasurementMap} tsnMeasurements Map of TSNs and their valid measurements
   * @return {*}  {(Pick<InsertSubCount, 'measurements_qualitative' | 'measurements_quantitative'>)}
   * @memberof ObservationService
   */
  _pullMeasurementsFromWorkSheetRowObject(
    row: Record<string, any>,
    measurementColumns: string[],
    tsnMeasurements: TsnMeasurementMap
  ): Pick<InsertSubCount, 'measurements_qualitative' | 'measurements_quantitative'> {
    const foundMeasurements: Pick<InsertSubCount, 'measurements_qualitative' | 'measurements_quantitative'> = {
      measurements_qualitative: [],
      measurements_quantitative: []
    };

    measurementColumns.forEach((mColumn) => {
      // Ignore blank columns
      if (!mColumn) {
        return;
      }

      const rowData = row[mColumn];

      // Ignore empty rows
      if (rowData === undefined) {
        return;
      }

      const measurement = findMeasurementFromTsnMeasurements(
        String(row['ITIS_TSN'] ?? row['TSN'] ?? row['TAXON'] ?? row['SPECIES']),
        mColumn,
        tsnMeasurements
      );

      // Ignore empty measurements
      if (!measurement) {
        return;
      }

      // if measurement is qualitative, find the option uuid
      if (isMeasurementCBQualitativeTypeDefinition(measurement)) {
        const foundOption = measurement.options.find(
          (option) =>
            option.option_label.toLowerCase() === String(rowData).toLowerCase() ||
            option.option_value === Number(rowData)
        );
        if (foundOption) {
          foundMeasurements.measurements_qualitative.push({
            measurement_id: measurement.taxon_measurement_id,
            measurement_option_id: foundOption.qualitative_option_id
          });
        }
      } else {
        foundMeasurements.measurements_quantitative.push({
          measurement_id: measurement.taxon_measurement_id,
          measurement_value: Number(rowData)
        });
      }
    });

    return foundMeasurements;
  }

  _pullEnvironmentsFromWorkSheetRowObject(
    row: Record<string, any>,
    environmentColumns: string[]
  ): Pick<InsertSubCount, 'environments_qualitative' | 'environments_quantitative'> {
    const foundEnvironments: Pick<InsertSubCount, 'environments_qualitative' | 'environments_quantitative'> = {
      environments_qualitative: [],
      environments_quantitative: []
    };

    environmentColumns.forEach((mColumn) => {
      // Ignore blank columns
      if (!mColumn) {
        return;
      }

      const rowData = row[mColumn];

      // Ignore empty rows
      if (rowData === undefined) {
        return;
      }

      //   const environment = findEnvironmentFromEnvironments(mColumn); // TODO
      const environment = null as unknown as any;

      // Ignore empty environments
      if (!environment) {
        return;
      }

      // if environment is qualitative, find the option id
      if (isEnvironmentQualitativeTypeDefinition(environment)) {
        const foundOption = environment.options.find(
          (option) => option.name.toLowerCase() === String(rowData).toLowerCase() || option.value === String(rowData)
        );
        if (foundOption) {
          foundEnvironments.environments_qualitative.push({
            environment_qualitative_option_id: foundOption.environment_qualitative_option_id
          });
        }
      } else {
        foundEnvironments.environments_quantitative.push({
          environment_quantitative_id: environment.environment_quantitative_id,
          value: Number(rowData)
        });
      }
    });

    return foundEnvironments;
  }

  /**
   * Maps over an array of inserted/updated observation records in order to update its scientific
   * name to match its ITIS TSN.
   *
   * @template RecordWithTaxonFields
   * @param {RecordWithTaxonFields[]} records
   * @return {*}  {Promise<RecordWithTaxonFields[]>}
   * @memberof ObservationService
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
    // deleting survey_observation records
    const service = new SubCountService(this.connection);
    await service.deleteObservationSubCountRecords(surveyId, observationIds);

    // Delete survey_observation records
    return this.observationRepository.deleteObservationsByIds(surveyId, observationIds);
  }

  /**
   * Validates given observations against measurement definitions found in Critterbase.
   * This validation is all or nothing, any failed validation will return a false value and stop processing.
   *
   * @param {InsertUpdateObservationsWithMeasurements[]} observationRows The observations to validate
   * @param {CritterbaseService} critterBaseService Used to collection measurement definitions to validate against
   * @returns {*} boolean True: Observations are valid False: Observations are invalid
   */
  async validateSurveyObservations(
    observationRows: InsertUpdateObservationsWithMeasurements[],
    critterBaseService: CritterbaseService
  ): Promise<boolean> {
    // Fetch measurement definitions from CritterBase
    const tsns = observationRows.map((item: any) => String(item.standardColumns.itis_tsn));
    const tsnMeasurementsMap = await getCBMeasurementsFromTSN(tsns, critterBaseService);

    // Map observation subcount data into objects to a IMeasurementDataToValidate array
    const measurementsToValidate: IMeasurementDataToValidate[] = observationRows.flatMap(
      (item: InsertUpdateObservationsWithMeasurements) => {
        return item.subcounts.flatMap((subcount) => {
          const qualitativeValues = subcount.measurements_qualitative.map((qualitative_measurement) => {
            return {
              tsn: String(item.standardColumns.itis_tsn),
              measurement_key: qualitative_measurement.measurement_id,
              measurement_value: qualitative_measurement.measurement_option_id
            };
          });

          const quantitativeValues: IMeasurementDataToValidate[] = subcount.measurements_quantitative.map(
            (quantitative_measurement) => {
              return {
                tsn: String(item.standardColumns.itis_tsn),
                measurement_key: quantitative_measurement.measurement_id,
                measurement_value: quantitative_measurement.measurement_value
              };
            }
          );

          return [...qualitativeValues, ...quantitativeValues];
        });
      }
    );

    // Validate measurement data against fetched measurement definition
    return validateMeasurements(measurementsToValidate, tsnMeasurementsMap);
  }
}
