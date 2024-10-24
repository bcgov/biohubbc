import { IDBConnection } from '../database/db';
import { ApiGeneralError } from '../errors/api-error';
import { IObservationAdvancedFilters } from '../models/observation-view';
import { CodeRepository } from '../repositories/code-repository';
import {
  InsertObservation,
  ObservationGeometryRecord,
  ObservationRecord,
  ObservationRecordWithSamplingAndSubcountData,
  ObservationRepository,
  ObservationSpecies,
  ObservationSubmissionRecord,
  UpdateObservation
} from '../repositories/observation-repository/observation-repository';
import {
  InsertObservationSubCountQualitativeEnvironmentRecord,
  InsertObservationSubCountQuantitativeEnvironmentRecord,
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
import { getCodeTypeDefinitions, validateCodes } from '../utils/observation-xlsx-utils/code-column-utils';
import { isQuantitativeValueValid } from '../utils/observation-xlsx-utils/common-utils';
import {
  EnvironmentNameTypeDefinitionMap,
  getEnvironmentColumnsTypeDefinitionMap,
  getEnvironmentTypeDefinitionsFromColumnNames,
  IEnvironmentDataToValidate,
  isEnvironmentQualitativeTypeDefinition,
  validateEnvironments
} from '../utils/observation-xlsx-utils/environment-column-utils';
import {
  getMeasurementColumnNames,
  getMeasurementFromTsnMeasurementTypeDefinitionMap,
  getTsnMeasurementTypeDefinitionMap,
  IMeasurementDataToValidate,
  isMeasurementCBQualitativeTypeDefinition,
  TsnMeasurementTypeDefinitionMap,
  validateMeasurements
} from '../utils/observation-xlsx-utils/measurement-column-utils';
import { CSV_COLUMN_ALIASES } from '../utils/xlsx-utils/column-aliases';
import { generateColumnCellGetterFromColumnValidator } from '../utils/xlsx-utils/column-validator-utils';
import {
  constructXLSXWorkbook,
  getDefaultWorksheet,
  getNonStandardColumnNamesFromWorksheet,
  getWorksheetRowObjects,
  IXLSXCSVValidator,
  validateCsvFile
} from '../utils/xlsx-utils/worksheet-utils';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from './critterbase-service';
import { DBService } from './db-service';
import { ObservationSubCountEnvironmentService } from './observation-subcount-environment-service';
import { ObservationSubCountMeasurementService } from './observation-subcount-measurement-service';
import { PlatformService } from './platform-service';
import { SamplePeriodService } from './sample-period-service';
import { SubCountService } from './subcount-service';

const defaultLog = getLogger('services/observation-service');

/**
 * An XLSX validation config for the standard columns of an Observation CSV.
 *
 * Note: `satisfies` allows `keyof` to correctly infer key types, while also
 * enforcing uppercase object keys.
 */
export const observationStandardColumnValidator = {
  ITIS_TSN: { type: 'number', aliases: CSV_COLUMN_ALIASES.ITIS_TSN },
  COUNT: { type: 'number' },
  OBSERVATION_SUBCOUNT_SIGN: { type: 'code', aliases: CSV_COLUMN_ALIASES.OBSERVATION_SUBCOUNT_SIGN },
  DATE: { type: 'date' },
  TIME: { type: 'string' },
  LATITUDE: { type: 'number', aliases: CSV_COLUMN_ALIASES.LATITUDE },
  LONGITUDE: { type: 'number', aliases: CSV_COLUMN_ALIASES.LONGITUDE },
  COMMENT: { type: 'string', aliases: CSV_COLUMN_ALIASES.COMMENT, optional: true }
} satisfies IXLSXCSVValidator;

export const getColumnCellValue = generateColumnCellGetterFromColumnValidator(observationStandardColumnValidator);

export interface InsertSubCount {
  observation_subcount_id: number | null;
  observation_subcount_sign_id: number | null;
  comment: string | null;
  subcount: number;
  qualitative_measurements: {
    measurement_id: string;
    measurement_option_id: string;
  }[];
  quantitative_measurements: {
    measurement_id: string;
    measurement_value: number;
  }[];
  qualitative_environments: {
    environment_qualitative_id: string; // uuid
    environment_qualitative_option_id: string;
  }[];
  quantitative_environments: {
    environment_quantitative_id: string; // uuid
    value: number;
  }[];
}

export type InsertUpdateObservations = {
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
   * Retrieves the paginated list of all observations that are available to the user, based on their permissions and
   * provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {IObservationAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<ObservationRecordWithSamplingAndSubcountData[]>}
   * @memberof ObservationService
   */
  async findObservations(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IObservationAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<ObservationRecordWithSamplingAndSubcountData[]> {
    return this.observationRepository.findObservations(isUserAdmin, systemUserId, filterFields, pagination);
  }

  /**
   * Upserts the given observation records and their associated measurements.
   *
   * @param {number} surveyId
   * @param {InsertUpdateObservations[]} observations
   * @return {*}  {Promise<void>}
   * @memberof ObservationService
   */
  async insertUpdateManualSurveyObservations(
    surveyId: number,
    observations: InsertUpdateObservations[]
  ): Promise<void> {
    const subCountService = new SubCountService(this.connection);
    const measurementService = new ObservationSubCountMeasurementService(this.connection);
    const environmentService = new ObservationSubCountEnvironmentService(this.connection);

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

      for (const subcount of observation.subcounts) {
        // Insert observation subcount record for each subcount.
        const observationSubCountRecord = await subCountService.insertObservationSubCount({
          survey_observation_id: surveyObservationId,
          //  NOTE: The UI currently only allows one subcount per observation, so the standardColumns count can be used
          subcount: observation.subcounts.length === 1 ? observation.standardColumns.count : subcount.subcount,
          observation_subcount_sign_id: subcount.observation_subcount_sign_id,
          comment: subcount.comment
        });

        if (!observation.subcounts.length) {
          return;
        }

        // TODO: Update process to fetch and find differences between incoming and existing data to only add, update or delete records as needed
        if (subcount.qualitative_measurements.length) {
          const qualitativeData: InsertObservationSubCountQualitativeMeasurementRecord[] =
            subcount.qualitative_measurements.map((item) => ({
              observation_subcount_id: observationSubCountRecord.observation_subcount_id,
              critterbase_taxon_measurement_id: item.measurement_id,
              critterbase_measurement_qualitative_option_id: item.measurement_option_id
            }));
          await measurementService.insertObservationSubCountQualitativeMeasurement(qualitativeData);
        }

        if (subcount.quantitative_measurements.length) {
          const quantitativeData: InsertObservationSubCountQuantitativeMeasurementRecord[] =
            subcount.quantitative_measurements.map((item) => ({
              observation_subcount_id: observationSubCountRecord.observation_subcount_id,
              critterbase_taxon_measurement_id: item.measurement_id,
              value: item.measurement_value
            }));
          await measurementService.insertObservationSubCountQuantitativeMeasurement(quantitativeData);
        }

        if (subcount.qualitative_environments.length) {
          const qualitativeData: InsertObservationSubCountQualitativeEnvironmentRecord[] =
            subcount.qualitative_environments.map((item) => ({
              observation_subcount_id: observationSubCountRecord.observation_subcount_id,
              environment_qualitative_id: item.environment_qualitative_id,
              environment_qualitative_option_id: item.environment_qualitative_option_id
            }));
          await environmentService.insertObservationSubCountQualitativeEnvironment(qualitativeData);
        }

        if (subcount.quantitative_environments.length) {
          const quantitativeData: InsertObservationSubCountQuantitativeEnvironmentRecord[] =
            subcount.quantitative_environments.map((item) => ({
              observation_subcount_id: observationSubCountRecord.observation_subcount_id,
              environment_quantitative_id: item.environment_quantitative_id,
              value: item.value
            }));
          await environmentService.insertObservationSubCountQuantitativeEnvironment(quantitativeData);
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
   * Retrieves all species observed in a given survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ObservationSpecies[]>}
   * @memberof ObservationRepository
   */
  async getObservedSpeciesForSurvey(surveyId: number): Promise<ObservationSpecies[]> {
    return this.observationRepository.getObservedSpeciesForSurvey(surveyId);
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
   * Retrieves the count of survey observations for the given survey
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IObservationAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async findObservationsCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IObservationAdvancedFilters
  ): Promise<number> {
    return this.observationRepository.findObservationsCount(isUserAdmin, systemUserId, filterFields);
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
   * Retrieves observation records count for the given survey and technique ids
   *
   * @param {number} surveyId
   * @param {number[]} methodTechniqueIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationService
   */
  async getObservationsCountByTechniqueIds(surveyId: number, methodTechniqueIds: number[]): Promise<number> {
    return this.observationRepository.getObservationsCountByTechniqueIds(surveyId, methodTechniqueIds);
  }

  /**
   * Processes an observation CSV file submission.
   *
   * This method:
   * - Receives an id belonging to an observation submission,
   * - Fetches the CSV file associated with the submission id
   * - Validates the CSV file and its content, failing the entire process if any validation check fails
   * - Appends all of the records in the CSV file to the observations for the survey.
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

    // Get the observation submission record
    const observationSubmissionRecord = await this.getObservationSubmissionById(surveyId, submissionId);

    // Get the S3 object containing the uploaded CSV file
    const s3Object = await getFileFromS3(observationSubmissionRecord.key);

    // Get the csv file from the S3 object
    const mediaFile = await parseS3File(s3Object);

    // Validate the CSV file mime type
    if (mediaFile.mimetype !== 'text/csv') {
      throw new Error('Failed to process file for importing observations. Invalid CSV file.');
    }

    // Construct the XLSX workbook
    const xlsxWorkBook = constructXLSXWorkbook(mediaFile);

    // Get the default XLSX worksheet
    const xlsxWorksheet = getDefaultWorksheet(xlsxWorkBook);

    // Validate the standard columns in the CSV file
    if (!validateCsvFile(xlsxWorksheet, observationStandardColumnValidator)) {
      throw new Error('Failed to process file for importing observations. Column validator failed.');
    }

    // Filter out the standard columns from the worksheet
    const nonStandardColumnNames = getNonStandardColumnNamesFromWorksheet(
      xlsxWorksheet,
      observationStandardColumnValidator
    );

    // Get the worksheet row objects
    const worksheetRowObjects = getWorksheetRowObjects(xlsxWorksheet);

    // VALIDATE CODES -----------------------------------------------------------------------------------------

    // TODO: This code column validation logic is specifically catered to the observation_subcount_signs code set, as
    // it is the only code set currently being used in the observation CSVs, and is required. This logic will need to
    // be updated to be more generic if other code sets are used in the future, or if they can be nullable.

    // Validate the Code columns in CSV file
    const codeRepository = new CodeRepository(this.connection);
    const codeTypeDefinitions = await getCodeTypeDefinitions(codeRepository);

    const codesToValidate = worksheetRowObjects.flatMap((row) => getColumnCellValue(row, 'OBSERVATION_SUBCOUNT_SIGN'));

    // Validate code column data
    if (!validateCodes(codesToValidate, codeTypeDefinitions)) {
      throw new Error('Failed to process file for importing observations. Code column validator failed.');
    }

    // VALIDATE MEASUREMENTS -----------------------------------------------------------------------------------------

    // Validate the Measurement columns in CSV file
    const critterBaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });

    // Fetch all measurement type definitions from Critterbase for all unique TSNs
    const tsns = worksheetRowObjects.map((row) =>
      String(row['ITIS_TSN'] ?? row['TSN'] ?? row['TAXON'] ?? row['SPECIES'])
    );

    const tsnMeasurementTypeDefinitionMap = await getTsnMeasurementTypeDefinitionMap(tsns, critterBaseService);

    // Get all measurement columns names from the worksheet, that match a measurement in the TSN measurements
    const measurementColumnNames = getMeasurementColumnNames(nonStandardColumnNames, tsnMeasurementTypeDefinitionMap);

    const measurementsToValidate: IMeasurementDataToValidate[] = worksheetRowObjects.flatMap((row) => {
      return measurementColumnNames.map((columnName) => ({
        tsn: String(row['ITIS_TSN'] ?? row['TSN'] ?? row['TAXON'] ?? row['SPECIES']),
        key: columnName,
        value: row[columnName]
      }));
    });

    // Validate measurement column data
    if (!validateMeasurements(measurementsToValidate, tsnMeasurementTypeDefinitionMap)) {
      throw new Error('Failed to process file for importing observations. Measurement column validator failed.');
    }

    // VALIDATE ENVIRONMENTS -----------------------------------------------------------------------------------------

    // Filter out the measurement columns from the non-standard columns.
    // Note: This assumes that after filtering out both standard and measurement columns, the remaining columns are the
    // environment columns
    const environmentColumnNames = nonStandardColumnNames.filter(
      (nonStandardColumnHeader) => !measurementColumnNames.includes(nonStandardColumnHeader)
    );

    const observationSubCountEnvironmentService = new ObservationSubCountEnvironmentService(this.connection);

    // Fetch all environment type definitions from SIMS for all unique environment column names in the CSV file
    const environmentTypeDefinitions = await getEnvironmentTypeDefinitionsFromColumnNames(
      environmentColumnNames,
      observationSubCountEnvironmentService
    );

    const environmentColumnsTypeDefinitionMap = getEnvironmentColumnsTypeDefinitionMap(
      environmentColumnNames,
      environmentTypeDefinitions
    );

    const environmentsToValidate: IEnvironmentDataToValidate[] = worksheetRowObjects.flatMap((row) => {
      return environmentColumnNames.map((columnName) => ({
        key: columnName,
        value: row[columnName]
      }));
    });

    // Validate environment column data
    if (!validateEnvironments(environmentsToValidate, environmentColumnsTypeDefinitionMap)) {
      throw new Error('Failed to process file for importing observations. Environment column validator failed.');
    }

    // -----------------------------------------------------------------------------------------

    let samplePeriodHierarchyIds: SamplePeriodHierarchyIds;

    if (options?.surveySamplePeriodId) {
      const samplePeriodService = new SamplePeriodService(this.connection);
      samplePeriodHierarchyIds = await samplePeriodService.getSamplePeriodHierarchyIds(
        surveyId,
        options.surveySamplePeriodId
      );
    }

    // Merge all the table rows into an array of InsertUpdateObservations[]
    const newRowData: InsertUpdateObservations[] = worksheetRowObjects.map((row) => {
      // TODO: This observationSubcountSignId logic is specifically catered to the observation_subcount_signs code set,
      // as it is the only code set currently being used in the observation CSVs, and is required. This logic will need
      // to be updated to be more generic if other code sets are used in the future, or if they can be nullable.
      const observationSubcountSignId = codeTypeDefinitions.OBSERVATION_SUBCOUNT_SIGN.find(
        (option) =>
          option.name.toLowerCase() === getColumnCellValue(row, 'OBSERVATION_SUBCOUNT_SIGN')?.cell?.toLowerCase()
      )?.id;

      const newSubcount: InsertSubCount = {
        observation_subcount_id: null,
        subcount: getColumnCellValue(row, 'COUNT').cell as number,
        observation_subcount_sign_id: observationSubcountSignId ?? null,
        comment: (getColumnCellValue(row, 'COMMENT').cell as string) ?? null,
        qualitative_measurements: [],
        quantitative_measurements: [],
        qualitative_environments: [],
        quantitative_environments: []
      };

      const measurements = this._pullMeasurementsFromWorkSheetRowObject(
        row,
        measurementColumnNames,
        tsnMeasurementTypeDefinitionMap
      );
      newSubcount.qualitative_measurements = measurements.qualitative_measurements;
      newSubcount.quantitative_measurements = measurements.quantitative_measurements;

      const environments = this._pullEnvironmentsFromWorkSheetRowObject(
        row,
        environmentColumnNames,
        environmentColumnsTypeDefinitionMap
      );
      newSubcount.qualitative_environments = environments.qualitative_environments;
      newSubcount.quantitative_environments = environments.quantitative_environments;

      return {
        standardColumns: {
          survey_id: surveyId,
          itis_tsn: getColumnCellValue(row, 'ITIS_TSN').cell as number,
          itis_scientific_name: null,
          survey_sample_site_id: samplePeriodHierarchyIds?.survey_sample_site_id ?? null,
          survey_sample_method_id: samplePeriodHierarchyIds?.survey_sample_method_id ?? null,
          survey_sample_period_id: samplePeriodHierarchyIds?.survey_sample_period_id ?? null,
          latitude: getColumnCellValue(row, 'LATITUDE').cell as number,
          longitude: getColumnCellValue(row, 'LONGITUDE').cell as number,
          count: getColumnCellValue(row, 'COUNT').cell as number,
          observation_time: getColumnCellValue(row, 'TIME').cell as string,
          observation_date: getColumnCellValue(row, 'DATE').cell as string
        },
        subcounts: [newSubcount]
      };
    });

    // Insert the parsed observation rows
    await this.insertUpdateManualSurveyObservations(surveyId, newRowData);
  }

  /**
   * This function is a helper method for the `processObservationCsvSubmission` function. It will take row data from an uploaded CSV
   * and find and connect the CSV measurement data with proper measurement taxon ids (UUIDs) from the TsnMeasurementTypeDefinitionMap passed in.
   * Any qualitative and quantitative measurements found are returned to be inserted into the database. This function assumes that the
   * data in the CSV has already been validated.
   *
   * @param {Record<string, any>} row A worksheet row object from a CSV that was uploaded for processing
   * @param {string[]} measurementColumns A list of the measurement columns found in a CSV uploaded
   * @param {TsnMeasurementTypeDefinitionMap} tsnMeasurements Map of TSNs and their valid measurements
   * @return {*}  {(Pick<InsertSubCount, 'qualitative_measurements' | 'quantitative_measurements'>)}
   * @memberof ObservationService
   */
  _pullMeasurementsFromWorkSheetRowObject(
    row: Record<string, any>,
    measurementColumns: string[],
    tsnMeasurements: TsnMeasurementTypeDefinitionMap
  ): Pick<InsertSubCount, 'qualitative_measurements' | 'quantitative_measurements'> {
    const foundMeasurements: Pick<InsertSubCount, 'qualitative_measurements' | 'quantitative_measurements'> = {
      qualitative_measurements: [],
      quantitative_measurements: []
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

      const measurement = getMeasurementFromTsnMeasurementTypeDefinitionMap(
        getColumnCellValue(row, 'ITIS_TSN').cell as string,
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
            option.option_value === Number(rowData) ||
            option.qualitative_option_id === rowData
        );

        if (!foundOption) {
          return;
        }

        foundMeasurements.qualitative_measurements.push({
          measurement_id: measurement.taxon_measurement_id,
          measurement_option_id: foundOption.qualitative_option_id
        });
      } else {
        foundMeasurements.quantitative_measurements.push({
          measurement_id: measurement.taxon_measurement_id,
          measurement_value: Number(rowData)
        });
      }
    });

    return foundMeasurements;
  }

  _pullEnvironmentsFromWorkSheetRowObject(
    row: Record<string, any>,
    environmentColumns: string[],
    environmentNameTypeDefinitionMap: EnvironmentNameTypeDefinitionMap
  ): Pick<InsertSubCount, 'qualitative_environments' | 'quantitative_environments'> {
    const foundEnvironments: Pick<InsertSubCount, 'qualitative_environments' | 'quantitative_environments'> = {
      qualitative_environments: [],
      quantitative_environments: []
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

      const environment = environmentNameTypeDefinitionMap.get(mColumn);

      // Ignore empty environments
      if (!environment) {
        return;
      }

      // if environment is qualitative, find the option id
      if (isEnvironmentQualitativeTypeDefinition(environment)) {
        const foundOption = environment.options.find((option) => option.name === String(rowData));

        if (!foundOption) {
          return;
        }

        foundEnvironments.qualitative_environments.push({
          environment_qualitative_id: foundOption.environment_qualitative_id,
          environment_qualitative_option_id: foundOption.environment_qualitative_option_id
        });
      } else {
        foundEnvironments.quantitative_environments.push({
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
   * @param {RecordWithTaxonFields[]} recordsToPatch
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
        taxonomyResponse.find((taxonItem) => taxonItem.tsn === recordToPatch.itis_tsn)?.scientificName ?? null;

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
   * Processes manual observation data.
   *
   * This method:
   * - Validates the given observations against environment definitions found in SIMS.
   * - Validates the given observations against measurement definitions found in Critterbase.
   * - Returns a boolean value indicating if the observations are valid. Returns as soon as an invalid observation is
   * found.
   *
   * @param {InsertUpdateObservations[]} observationRows The observations to validate
   * @param {CritterbaseService} critterBaseService Used to fetch measurement definitions to validate against
   * @param {ObservationSubCountEnvironmentService} observationSubCountEnvironmentService Used to fetch environment
   * definitions to validate against
   * @return {*}  {Promise<boolean>} `true` if the observations are valid, `false` otherwise
   * @memberof ObservationService
   */
  async validateSurveyObservations(
    observationRows: InsertUpdateObservations[],
    critterBaseService: CritterbaseService,
    observationSubCountEnvironmentService: ObservationSubCountEnvironmentService
  ): Promise<boolean> {
    // VALIDATE ENVIRONMENTS -----------------------------------------------------------------------------------------

    // Map incoming observation subcount data objects into IEnvironmentDataToValidate arrays
    let qualitativeEnvironmentsToValidate: IEnvironmentDataToValidate[] = [];
    let quantitativeEnvironmentsToValidate: IEnvironmentDataToValidate[] = [];

    for (const observationRow of observationRows) {
      for (const subcount of observationRow.subcounts) {
        qualitativeEnvironmentsToValidate = subcount.qualitative_environments.map((qualitative_environment) => {
          return {
            key: qualitative_environment.environment_qualitative_id,
            value: qualitative_environment.environment_qualitative_option_id
          };
        });

        quantitativeEnvironmentsToValidate = subcount.quantitative_environments.map((quantitative_environment) => {
          return {
            key: quantitative_environment.environment_quantitative_id,
            value: quantitative_environment.value
          };
        });
      }
    }

    // Fetch all environment type definitions from SIMS for all unique environment keys in the incoming data
    const [qualitativeEnvironmentTypeDefinitions, quantitativeEnvironmentTypeDefinitions] = await Promise.all([
      observationSubCountEnvironmentService.getQualitativeEnvironmentTypeDefinitions(
        qualitativeEnvironmentsToValidate.map((env) => env.key)
      ),
      observationSubCountEnvironmentService.getQuantitativeEnvironmentTypeDefinitions(
        quantitativeEnvironmentsToValidate.map((env) => env.key)
      )
    ]);

    // Validated incoming qualitative environments against fetched qualitative environment definitions
    for (const qualitativeEnvironmentToValidate of qualitativeEnvironmentsToValidate) {
      const foundEnvironment = qualitativeEnvironmentTypeDefinitions.find(
        (env) => env.environment_qualitative_id === qualitativeEnvironmentToValidate.key
      );

      if (!foundEnvironment) {
        defaultLog.debug({
          label: 'validateSurveyObservations',
          message: 'Qualitative environments are invalid',
          errors: ['Failed to find matching qualitative environment record']
        });
        // Return early if incoming environment column data is invalid
        return false;
      }

      const validOption = foundEnvironment?.options.find(
        (option) => option.environment_qualitative_option_id === qualitativeEnvironmentToValidate.value
      );

      if (!validOption) {
        defaultLog.debug({
          label: 'validateSurveyObservations',
          message: 'Qualitative environments are invalid',
          errors: ['Failed to find matching qualitative environment option record']
        });
        // Return early if incoming environment column data is invalid
        return false;
      }
    }

    // Validated incoming quantitative environments against fetched quantitative environment definitions
    for (const quantitativeEnvironmentToValidate of quantitativeEnvironmentsToValidate) {
      const foundEnvironment = quantitativeEnvironmentTypeDefinitions.find(
        (env) => env.environment_quantitative_id === quantitativeEnvironmentToValidate.key
      );

      if (!foundEnvironment) {
        defaultLog.debug({
          label: 'validateSurveyObservations',
          message: 'Quantitative environments are invalid',
          errors: ['Failed to find matching quantitative environment record']
        });
        // Return early if incoming environment column data is invalid
        return false;
      }

      const validValue = isQuantitativeValueValid(
        Number(quantitativeEnvironmentToValidate.value),
        foundEnvironment.min,
        foundEnvironment.max
      );

      if (!validValue) {
        defaultLog.debug({
          label: 'validateSurveyObservations',
          message: 'Quantitative environments are invalid',
          errors: ['Quantitative environment value is out of range']
        });
        // Return early if incoming environment column data is invalid
        return false;
      }
    }

    // VALIDATE MEASUREMENTS -----------------------------------------------------------------------------------------

    // Fetch all measurement type definitions from Critterbase for all unique TSNs
    const tsns = observationRows.map((row) => String(row.standardColumns.itis_tsn));
    const tsnMeasurementTypeDefinitionMap = await getTsnMeasurementTypeDefinitionMap(tsns, critterBaseService);

    // Map observation subcount data objects into a IMeasurementDataToValidate array
    const measurementsToValidate: IMeasurementDataToValidate[] = observationRows.flatMap(
      (item: InsertUpdateObservations) => {
        return item.subcounts.flatMap((subcount) => {
          const qualitativeMeasurementsToValidate = subcount.qualitative_measurements.map((qualitative_measurement) => {
            return {
              tsn: String(item.standardColumns.itis_tsn),
              key: qualitative_measurement.measurement_id,
              value: qualitative_measurement.measurement_option_id
            };
          });

          const quantitativeMeasurementsToValidate: IMeasurementDataToValidate[] =
            subcount.quantitative_measurements.map((quantitative_measurement) => {
              return {
                tsn: String(item.standardColumns.itis_tsn),
                key: quantitative_measurement.measurement_id,
                value: quantitative_measurement.measurement_value
              };
            });

          return [...qualitativeMeasurementsToValidate, ...quantitativeMeasurementsToValidate];
        });
      }
    );

    // Validate measurement data against fetched measurement definition
    const areMeasurementsValid = validateMeasurements(measurementsToValidate, tsnMeasurementTypeDefinitionMap);

    if (!areMeasurementsValid) {
      defaultLog.debug({ label: 'validateSurveyObservations', message: 'Measurements are invalid' });
      // Return early if measurements are invalid
      return false;
    }

    // ---------------------------------------------------------------------------------------------------------------

    // Return true if both environments and measurements are valid
    return true;
  }
}
