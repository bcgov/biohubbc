import { SurveyObservationRecord } from '../../database-models/survey_observation';
import { IDBConnection } from '../../database/db';
import { IObservationAdvancedFilters } from '../../models/observation-view';
import {
  InsertObservation,
  ObservationGeometryRecord,
  ObservationRecordWithSamplingAndSubcountData,
  ObservationRepository,
  ObservationSpecies,
  ObservationSubmissionRecord,
  UpdateObservation
} from '../../repositories/observation-repository/observation-repository';
import {
  InsertObservationSubCountQualitativeEnvironmentRecord,
  InsertObservationSubCountQuantitativeEnvironmentRecord,
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../../repositories/observation-subcount-environment-repository';
import {
  InsertObservationSubCountQualitativeMeasurementRecord,
  InsertObservationSubCountQuantitativeMeasurementRecord
} from '../../repositories/observation-subcount-measurement-repository';
import { SurveySamplePeriodDetails } from '../../repositories/sample-period-repository';
import { generateS3FileKey } from '../../utils/file-utils';
import { getLogger } from '../../utils/logger';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from '../critterbase-service';
import { DBService } from '../db-service';
import { getTsnMeasurementDictionary } from '../import-services/utils/measurement';
import { validateQualitativeValue } from '../import-services/utils/qualitative';
import { validateQuantitativeValue } from '../import-services/utils/quantitative';
import { ObservationSubCountEnvironmentService } from '../observation-subcount-environment-service';
import { ObservationSubCountMeasurementService } from '../observation-subcount-measurement-service';
import { SamplePeriodService } from '../sample-period-service';
import { SubCountService } from '../subcount-service';

export const defaultLog = getLogger('services/observation-services/observation-service');

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

export type ObservationSamplingSupplementaryData = {
  sampling_data: SurveySamplePeriodDetails[];
};

export type AllObservationSupplementaryData = ObservationCountSupplementaryData &
  ObservationMeasurementSupplementaryData &
  ObservationSamplingSupplementaryData;

export interface IEnvironmentDataToValidate {
  key: string;
  value: string | number;
}

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
      const upsertedObservationRecord = await this.observationRepository.insertUpdateSurveyObservations(surveyId, [
        observation.standardColumns
      ]);

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
   * @return {*}  {Promise<SurveyObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async getAllSurveyObservations(surveyId: number): Promise<SurveyObservationRecord[]> {
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
   * @return {*}  {Promise<SurveyObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationById(surveyId: number, surveyObservationId: number): Promise<SurveyObservationRecord> {
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
    const samplePeriodService = new SamplePeriodService(this.connection);
    const subCountService = new SubCountService(this.connection);

    const [
      surveyObservations,
      observationCount,
      measurementTypeDefinitions,
      environmentTypeDefinitions,
      samplePeriods
    ] = await Promise.all([
      // Fetch observations
      this.observationRepository.getSurveyObservationsWithSamplingDataWithAttributesData(surveyId, pagination),
      // Fetch pagination count data
      this.observationRepository.getSurveyObservationCount(surveyId),
      // Fetch supplementary data
      subCountService.getMeasurementTypeDefinitionsForSurvey(surveyId),
      subCountService.getEnvironmentTypeDefinitionsForSurvey(surveyId),
      samplePeriodService.getSamplePeriodsForSurvey(surveyId)
    ]);

    return {
      surveyObservations: surveyObservations,
      supplementaryObservationData: {
        observationCount,
        qualitative_measurements: measurementTypeDefinitions.qualitative_measurements,
        quantitative_measurements: measurementTypeDefinitions.quantitative_measurements,
        qualitative_environments: environmentTypeDefinitions.qualitative_environments,
        quantitative_environments: environmentTypeDefinitions.quantitative_environments,
        sampling_data: samplePeriods
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
    }

    // VALIDATE MEASUREMENTS -----------------------------------------------------------------------------------------

    const observationMeasurementsAreValid = await this._validateObservationMeasurements(
      observationRows,
      critterBaseService
    );

    if (!observationMeasurementsAreValid) {
      defaultLog.debug({ label: 'validateSurveyObservations', message: 'Measurements are invalid' });
      // Return early if measurements are invalid
      return false;
    }

    // ---------------------------------------------------------------------------------------------------------------

    // Return true if both environments and measurements are valid
    return true;
  }

  /**
   * Validates all qualitative and quantitative measurements against fetched measurement definitions.
   *
   * @param {InsertUpdateObservations[]} observations The observations to validate
   * @param {CritterbaseService} critterbaseService Used to fetch measurement definitions to validate against
   * @return {*}  {Promise<boolean>} `true` if the observations are valid, `false` otherwise
   */
  async _validateObservationMeasurements(
    observations: InsertUpdateObservations[],
    critterbaseService: CritterbaseService
  ) {
    // Fetch all measurement type definitions from Critterbase for all unique TSNs
    const tsns = observations.map((row) => row.standardColumns.itis_tsn);

    const tsnMeasurementTypeDefinitionMap = await getTsnMeasurementDictionary(tsns, critterbaseService);

    // Validate all qualitative measurements against fetched measurement definitions
    const qualitativeMeasurementsAreAllValid = observations.every((observationRow) => {
      return observationRow.subcounts.every((subcount) => {
        return subcount.qualitative_measurements.every((qualitative_measurement) => {
          const measurementDefinition = tsnMeasurementTypeDefinitionMap.get(
            observationRow.standardColumns.itis_tsn,
            qualitative_measurement.measurement_id
          ) as CBQualitativeMeasurementTypeDefinition;

          if (!measurementDefinition) {
            return false;
          }

          // Validate the qualitative value against the measurement definition (not a list of errors)
          return !Array.isArray(
            validateQualitativeValue(qualitative_measurement.measurement_option_id, {
              options: measurementDefinition.options.map((option) => ({
                option_id: option.qualitative_option_id,
                option_name: option.option_label
              }))
            })
          );
        });
      });
    });

    // Validate all quantitative measurements against fetched measurement definitions
    const quantitativeMeasurementsAreAllValid = observations.every((observationRow) => {
      return observationRow.subcounts.every((subcount) => {
        return subcount.quantitative_measurements.every((quantitative_measurement) => {
          const measurementDefinition = tsnMeasurementTypeDefinitionMap.get(
            observationRow.standardColumns.itis_tsn,
            quantitative_measurement.measurement_id
          ) as CBQuantitativeMeasurementTypeDefinition;

          if (!measurementDefinition) {
            return false;
          }

          // Validate the quantitative value against the measurement definition (not a list of errors)
          return !Array.isArray(
            validateQuantitativeValue(quantitative_measurement.measurement_value, {
              min: measurementDefinition.min_value,
              max: measurementDefinition.max_value
            })
          );
        });
      });
    });

    return qualitativeMeasurementsAreAllValid && quantitativeMeasurementsAreAllValid;
  }
}
