import { z } from 'zod';
import { SurveyObservationRecord } from '../../database-models/survey_observation';
import { getKnex, IDBConnection } from '../../database/db';
import { IObservationAdvancedFilters } from '../../models/observation-view';
import {
  InsertObservationQualitativeEnvironmentRecord,
  InsertObservationQuantitativeEnvironmentRecord
} from '../../repositories/observation-environment-repository';
import { ObservationRepository } from '../../repositories/observation-repository/observation-repository';
import {
  AllObservationSupplementaryData,
  FlattenedObservationRecordWithSamplingAndSubcountData,
  InsertSurveyObservation,
  ObservationCountSupplementaryData,
  ObservationGeometryRecord,
  ObservationRecordWithSampling,
  ObservationRecordWithSamplingAndSubcountData,
  ObservationSpecies,
  SurveyObservationWithSupplementaryData,
  UpdateSurveyObservation
} from '../../repositories/observation-repository/observation-repository.interface';
import {
  InsertObservationSubCountQualitativeMeasurementRecord,
  InsertObservationSubCountQuantitativeMeasurementRecord
} from '../../repositories/observation-subcount-measurement-repository';
import { getLogger } from '../../utils/logger';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { DBService } from '../db-service';
import { ObservationEnvironmentService } from '../observation-environment-service';
import { ObservationSubCountMeasurementService } from '../observation-subcount-measurement-service';
import { SamplePeriodService } from '../sample-period-service';
import { SubCountService } from '../subcount-service';

const defaultLog = getLogger('services/observation-services/observation-service');

export class ObservationService extends DBService {
  observationRepository: ObservationRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.observationRepository = new ObservationRepository(connection);
  }

  /**
   * Inserts a observation records.
   *
   * @param {number} surveyId
   * @param {InsertSurveyObservation[]} observations
   * @return {*}  {Promise<void>}
   * @memberof ObservationService
   */
  async insertObservations(surveyId: number, observations: InsertSurveyObservation[]): Promise<void> {
    const subCountService = new SubCountService(this.connection);
    const observationSubCountMeasurementService = new ObservationSubCountMeasurementService(this.connection);
    const observationEnvironmentService = new ObservationEnvironmentService(this.connection);

    for (const observation of observations) {
      // -- Observation Data --------------------------------------------------------------

      // Upsert observation standard columns
      const insertedObservationRecord = await this.observationRepository.insertSurveyObservation(surveyId, observation);

      const surveyObservationId = insertedObservationRecord.survey_observation_id;

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
      await subCountService.deleteObservationSubCountRecordsByObservationId(surveyId, [surveyObservationId]);

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
   * Updates a observation record.
   *
   * @param {number} surveyId
   * @param {UpdateSurveyObservation} observation
   * @return {*}  {Promise<void>}
   * @memberof ObservationService
   */
  async updateObservation(surveyId: number, observation: UpdateSurveyObservation): Promise<void> {
    const subCountService = new SubCountService(this.connection);
    const observationSubCountMeasurementService = new ObservationSubCountMeasurementService(this.connection);
    const observationEnvironmentService = new ObservationEnvironmentService(this.connection);

    // -- Observation Data --------------------------------------------------------------

    // Upsert observation standard columns
    const insertedObservationRecord = await this.observationRepository.updateSurveyObservation(surveyId, observation);

    const surveyObservationId = insertedObservationRecord.survey_observation_id;

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
    await subCountService.deleteObservationSubCountRecordsByObservationId(surveyId, [surveyObservationId]);

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
        await observationSubCountMeasurementService.insertObservationSubCountQuantitativeMeasurement(quantitativeData);
      }
    }
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
   * @return {*}  {Promise<ObservationRecordWithSampling[]>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationById(
    surveyId: number,
    surveyObservationId: number
  ): Promise<ObservationRecordWithSampling> {
    return this.observationRepository.getSurveyObservationById(surveyId, surveyObservationId);
  }

  /**
   * Get a survey observation record, for as survey.
   *
   * @param {number} surveyId
   * @param {number} surveyObservationId
   * @return {*}  {Promise<SurveyObservationWithSupplementaryData>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationByIdWithSupplementaryData(
    surveyId: number,
    surveyObservationId: number
  ): Promise<SurveyObservationWithSupplementaryData> {
    const subCountService = new SubCountService(this.connection);
    const observationEnvironmentService = new ObservationEnvironmentService(this.connection);
    const samplePeriodService = new SamplePeriodService(this.connection);

    const [surveyObservation, measurementTypeDefinitions, environmentTypeDefinitions, samplePeriods] =
      await Promise.all([
        // Fetch observation
        this.observationRepository.getSurveyObservationByIdWithSupplementaryData(surveyId, surveyObservationId),
        // Fetch supplementary data
        subCountService.getMeasurementTypeDefinitionsForSurvey(surveyId, {
          filterFields: { surveyObservationIds: [surveyObservationId] }
        }),
        observationEnvironmentService.getEnvironmentTypeDefinitionsForSurvey(surveyId, {
          filterFields: { surveyObservationIds: [surveyObservationId] }
        }),
        samplePeriodService.getSamplePeriodsForObservation(surveyId, surveyObservationId)
      ]);

    return {
      surveyObservation: surveyObservation,
      supplementaryObservationData: {
        observationCount: 1,
        qualitative_measurements: measurementTypeDefinitions.qualitative_measurements,
        quantitative_measurements: measurementTypeDefinitions.quantitative_measurements,
        qualitative_environments: environmentTypeDefinitions.qualitative_environments,
        quantitative_environments: environmentTypeDefinitions.quantitative_environments,
        sampling_data: samplePeriods
      }
    };
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
    const subCountService = new SubCountService(this.connection);
    const observationEnvironmentService = new ObservationEnvironmentService(this.connection);
    const samplePeriodService = new SamplePeriodService(this.connection);

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
      observationEnvironmentService.getEnvironmentTypeDefinitionsForSurvey(surveyId),
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
    const subCountService = new SubCountService(this.connection);
    const observationEnvironmentService = new ObservationEnvironmentService(this.connection);
    const samplePeriodService = new SamplePeriodService(this.connection);

    // Fetch observations
    const surveyObservations = await this.observationRepository.getSurveyFlattenedObservations(surveyId, pagination);

    const surveyObservationIds = surveyObservations.map((item) => item.survey_observation_id);

    const [observationCount, measurementTypeDefinitions, environmentTypeDefinitions, samplePeriods] = await Promise.all(
      [
        // Fetch pagination count data
        this.observationRepository.getSurveyFlattenedObservationsCount(surveyId),
        // Fetch supplementary data
        subCountService.getMeasurementTypeDefinitionsForSurvey(surveyId, { filterFields: { surveyObservationIds } }),
        observationEnvironmentService.getEnvironmentTypeDefinitionsForSurvey(surveyId, {
          filterFields: { surveyObservationIds }
        }),
        samplePeriodService.getSamplePeriodsForSurvey(surveyId, { filterFields: { surveyObservationIds } })
      ]
    );

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
   * Get the survey observation ids that have no subcount records, for the given survey and set of survey observation
   * ids.
   *
   * @param {number} surveyId
   * @param {{
   *       filterFields?: {
   *         surveyObservationIds?: number[];
   *       };
   *     }} [options] Optional fields to additionally filter results by
   * @return {*}  {Promise<number[]>}
   * @memberof SubCountRepository
   */
  async getOrphanedSurveyObservationIds(
    surveyId: number,
    options?: {
      filterFields?: {
        surveyObservationIds?: number[];
      };
    }
  ): Promise<number[]> {
    const knex = getKnex();
    const queryBuilder = knex.queryBuilder();

    queryBuilder
      .select('survey_observation.survey_observation_id')
      .from('survey_observation')
      .where('survey_observation.survey_id', surveyId)
      .whereNotExists((qb) => {
        qb.select(knex.raw('1'))
          .from('observation_subcount')
          .whereRaw('observation_subcount.survey_observation_id = survey_observation.survey_observation_id');
      });

    if (options?.filterFields?.surveyObservationIds) {
      queryBuilder.whereIn('survey_observation.survey_observation_id', options.filterFields.surveyObservationIds);
    }

    const response = await this.connection.knex(queryBuilder, z.object({ survey_observation_id: z.number() }));

    return response.rows.map((row) => row.survey_observation_id);
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
    await service.deleteObservationSubCountRecordsByObservationId(surveyId, observationIds);

    // Delete observation environments, if any
    const observationEnvironmentService = new ObservationEnvironmentService(this.connection);
    await observationEnvironmentService.deleteObservationEnvironments(surveyId, observationIds);

    // Delete survey_observation records
    return this.observationRepository.deleteObservationsByIds(surveyId, observationIds);
  }
}
