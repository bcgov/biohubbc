import { SurveyObservationRecord } from '../../database-models/survey_observation';
import { IDBConnection } from '../../database/db';
import { IObservationAdvancedFilters } from '../../models/observation-view';
import {
  InsertObservationQualitativeEnvironmentRecord,
  InsertObservationQuantitativeEnvironmentRecord,
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../../repositories/observation-environment-repository';
import {
  FlattenedObservationRecordWithSamplingAndSubcountData,
  InsertObservation,
  ObservationGeometryRecord,
  ObservationRecordWithSamplingAndSubcountData,
  ObservationRepository,
  ObservationSpecies,
  ObservationSubmissionRecord,
  UpdateObservation
} from '../../repositories/observation-repository/observation-repository';
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
  CBQuantitativeMeasurementTypeDefinition
} from '../critterbase-service';
import { DBService } from '../db-service';
import { ObservationEnvironmentService } from '../observation-environment-service';
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
}

export type InsertUpdateObservations = {
  standardColumns: InsertObservation | UpdateObservation;
  subcounts: InsertSubCount[];
};

export type InsertObservations = {
  standardColumns: {
    itis_tsn: number;
    itis_scientific_name: string | null;
    survey_sample_period_id: string | null;
    count: string | null;
    latitude: string | null;
    longitude: string | null;
    observation_date: string | null;
    observation_time: string | null;
    observation_sign_id: number | null;
    qualitative_environments: {
      environment_qualitative_id: string;
      environment_qualitative_option_id: string;
    }[];
    quantitative_environments: {
      environment_quantitative_id: string;
      value: string;
    }[];
  };
  subcounts: {
    subcount: number;
    comment: string | null;
    qualitative_measurements: {
      measurement_id: string;
      measurement_option_id: string;
    }[];
    quantitative_measurements: {
      measurement_id: string;
      measurement_value: number;
    }[];
  }[];
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
   * Retrieves the paginated list of all observations that are available to the user, based on their permissions and
   * provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {IObservationAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<FlattenedObservationRecordWithSamplingAndSubcountData[]>}
   * @memberof ObservationService
   */
  async findFlattenedObservations(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IObservationAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FlattenedObservationRecordWithSamplingAndSubcountData[]> {
    return this.observationRepository.findFlattenedObservations(isUserAdmin, systemUserId, filterFields, pagination);
  }

  /**
   * Upserts the given observation records and their associated subcounts.
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
    const observationSubCountMeasurementService = new ObservationSubCountMeasurementService(this.connection);
    const observationEnvironmentService = new ObservationEnvironmentService(this.connection);

    for (const observation of observations) {
      // -- Observation Data --------------------------------------------------------------

      // Upsert observation standard columns
      const upsertedObservationRecord = await this.observationRepository.insertUpdateSurveyObservations(surveyId, [
        observation.standardColumns
      ]);

      const surveyObservationId = upsertedObservationRecord[0].survey_observation_id;

      // -- Observation Environment Data --------------------------------------------------------------

      // TODO: Update 'delete environment' process to fetch and find differences between incoming and existing data to
      // only add, update or delete records as needed

      // Delete old observation environment records
      await observationEnvironmentService.deleteObservationEnvironments(surveyId, [surveyObservationId]);

      const qualitativeEnvironmentData: InsertObservationQualitativeEnvironmentRecord[] =
        observation.standardColumns.qualitative_environments.map((item) => ({
          survey_observation_id: surveyObservationId,
          environment_qualitative_id: item.environment_qualitative_id,
          environment_qualitative_option_id: item.environment_qualitative_option_id
        }));
      await observationEnvironmentService.insertObservationQualitativeEnvironment(qualitativeEnvironmentData);

      const quantitativeEnvironmentData: InsertObservationQuantitativeEnvironmentRecord[] =
        observation.standardColumns.quantitative_environments.map((item) => ({
          survey_observation_id: surveyObservationId,
          environment_quantitative_id: item.environment_quantitative_id,
          value: item.value
        }));
      await observationEnvironmentService.insertObservationQuantitativeEnvironment(quantitativeEnvironmentData);

      // -- Observation Subcount Data --------------------------------------------------------------

      // TODO: Update 'delete subcount' process to fetch and find differences between incoming and existing data to
      // only add, update or delete records as needed

      // Delete old observation subcount records (critters, measurements and subcounts)
      await subCountService.deleteObservationSubCountRecords(surveyId, [surveyObservationId]);

      for (const subcount of observation.subcounts) {
        // -- Subcount Data --------------------------------------------------------------

        // Insert observation subcount record for each subcount.
        const observationSubCountRecord = await subCountService.insertObservationSubCount({
          survey_observation_id: surveyObservationId,
          subcount: subcount.subcount,
          comment: subcount.comment
        });

        // -- Subcount Measurement Data --------------------------------------------------------------

        if (subcount.qualitative_measurements.length) {
          const qualitativeData: InsertObservationSubCountQualitativeMeasurementRecord[] =
            subcount.qualitative_measurements.map((item) => ({
              observation_subcount_id: observationSubCountRecord.observation_subcount_id,
              critterbase_taxon_measurement_id: item.measurement_id,
              critterbase_measurement_qualitative_option_id: item.measurement_option_id
            }));
          await observationSubCountMeasurementService.insertObservationSubCountQualitativeMeasurement(qualitativeData);
        }

        if (subcount.quantitative_measurements.length) {
          const quantitativeData: InsertObservationSubCountQuantitativeMeasurementRecord[] =
            subcount.quantitative_measurements.map((item) => ({
              observation_subcount_id: observationSubCountRecord.observation_subcount_id,
              critterbase_taxon_measurement_id: item.measurement_id,
              value: item.measurement_value
            }));
          await observationSubCountMeasurementService.insertObservationSubCountQuantitativeMeasurement(
            quantitativeData
          );
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
      this.observationRepository.getSurveyObservations(surveyId, pagination),
      // Fetch pagination count data
      this.observationRepository.getSurveyObservationsCount(surveyId),
      // Fetch supplementary data
      subCountService.getMeasurementTypeDefinitionsForSurvey(surveyId),
      this.getEnvironmentTypeDefinitionsForSurvey(surveyId),
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
   * Retrieves all flattened observation records for the given survey along with supplementary data
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<{
   *     surveyObservations: FlattenedObservationRecordWithSamplingAndSubcountData[];
   *     supplementaryObservationData: AllObservationSupplementaryData;
   *   }>}
   * @memberof ObservationService
   */
  async getSurveyFlattenedObservationsWithSupplementaryAndSamplingDataAndAttributeData(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<{
    surveyObservations: FlattenedObservationRecordWithSamplingAndSubcountData[];
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
      this.observationRepository.getSurveyFlattenedObservations(surveyId, pagination),
      // Fetch pagination count data
      this.observationRepository.getSurveyFlattenedObservationsCount(surveyId),
      // Fetch supplementary data
      subCountService.getMeasurementTypeDefinitionsForSurvey(surveyId),
      this.getEnvironmentTypeDefinitionsForSurvey(surveyId),
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
    const observationCount = await this.observationRepository.getSurveyObservationsCount(surveyId);

    return { surveyObservationsGeometry, supplementaryObservationData: { observationCount } };
  }

  /**
   * Retrieves the count of survey observations for the given survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationsCount(surveyId: number): Promise<number> {
    return this.observationRepository.getSurveyObservationsCount(surveyId);
  }

  /**
   * Retrieves the count of flattened survey observations for the given survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async getSurveyFlattenedObservationsCount(surveyId: number): Promise<number> {
    return this.observationRepository.getSurveyFlattenedObservationsCount(surveyId);
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
   * Retrieves the count of flattened survey observations for the given survey
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IObservationAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async findFlattenedObservationsCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IObservationAdvancedFilters
  ): Promise<number> {
    return this.observationRepository.findFlattenedObservationsCount(isUserAdmin, systemUserId, filterFields);
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
   * Returns a unique set of all environment type definitions for all environments of all observations in the given
   * survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<{
   *     qualitative_environments: QualitativeEnvironmentTypeDefinition[];
   *     quantitative_environments: QuantitativeEnvironmentTypeDefinition[];
   *   }>}
   * @memberof ObservationService
   */
  async getEnvironmentTypeDefinitionsForSurvey(surveyId: number): Promise<{
    qualitative_environments: QualitativeEnvironmentTypeDefinition[];
    quantitative_environments: QuantitativeEnvironmentTypeDefinition[];
  }> {
    const observationEnvironmentService = new ObservationEnvironmentService(this.connection);

    const [qualitativeEnvironmentTypeDefinitions, quantitativeEnvironmentTypeDefinitions] = await Promise.all([
      observationEnvironmentService.getQualitativeEnvironmentTypeDefinitionsForSurvey(surveyId),
      observationEnvironmentService.getQuantitativeEnvironmentTypeDefinitionsForSurvey(surveyId)
    ]);

    return {
      qualitative_environments: qualitativeEnvironmentTypeDefinitions,
      quantitative_environments: quantitativeEnvironmentTypeDefinitions
    };
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
    RecordWithTaxonFields extends Pick<SurveyObservationRecord, 'itis_tsn' | 'itis_scientific_name'>
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
    // Remove any existing child subcount records (observation_subcount, subcount_critter) before
    // deleting survey_observation records
    const service = new SubCountService(this.connection);
    await service.deleteObservationSubCountRecords(surveyId, observationIds);

    // Delete observation environments, if any
    const observationEnvironmentService = new ObservationEnvironmentService(this.connection);
    await observationEnvironmentService.deleteObservationEnvironments(surveyId, observationIds);

    // Delete survey_observation records
    return this.observationRepository.deleteObservationsByIds(surveyId, observationIds);
  }
}
