import { ObservationSubcountRecord } from '../database-models/observation_subcount';
import { IDBConnection } from '../database/db';
import { ObservationSubcountMeasurements } from '../repositories/observation-repository/observation-repository.interface';
import { InsertObservationSubCount, SubCountRepository } from '../repositories/subcount-repository';
import { CritterbaseService } from './critterbase-service';
import { DBService } from './db-service';
import { ObservationService } from './observation-services/observation-service';
import { ObservationSubCountMeasurementService } from './observation-subcount-measurement-service';
import { SubcountCritterService } from './subcount-critter-service';

export class SubCountService extends DBService {
  subCountRepository: SubCountRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.subCountRepository = new SubCountRepository(connection);
  }

  /**
   * Inserts a new observation sub count
   *
   * @param {InsertObservationSubCount} record
   * @returns {*} {Promise<ObservationSubcountRecord>}
   * @memberof SubCountService
   */
  async insertObservationSubCount(record: InsertObservationSubCount): Promise<ObservationSubcountRecord> {
    return this.subCountRepository.insertObservationSubCount(record);
  }

  /**
   * Delete an observation subcount record.
   *
   * Note: If all observation subcount records are deleted for a given survey observation record, then the survey
   * observation records will also be deleted, as all survey observations must have at least one subcount.
   *
   * @param {number} surveyId
   * @param {number} observationSubcountId
   * @return {*}  {Promise<void>}
   * @memberof ObservationRepository
   */
  async deleteObservationSubcount(surveyId: number, observationSubcountId: number): Promise<void> {
    await this.deleteObservationSubcountRecords(surveyId, [observationSubcountId]);
  }

  /**
   * Deletes all observation subcount records for the given observation subcount ids, and dependent records.
   *
   * Note: If all subcount records are deleted for a given survey observation record, then the survey observation
   * records will also be deleted, as all survey observations should have at least one subcount.
   *
   * @param {number} surveyId
   * @param {number[]} observationSubcountIds
   * @return {*}  {Promise<void>}
   * @memberof ObservationRepository
   */
  async deleteObservationSubcountRecords(surveyId: number, observationSubcountIds: number[]): Promise<void> {
    const subCountCritterService = new SubcountCritterService(this.connection);
    const observationSubCountMeasurementService = new ObservationSubCountMeasurementService(this.connection);

    // Delete child records
    await Promise.all([
      // Delete child subcount_critter records, if any
      subCountCritterService.deleteSubcountCrittersByObservationSubcountId(surveyId, observationSubcountIds),
      // Delete child observation measurements, if any
      observationSubCountMeasurementService.deleteMeasurementsByObservationSubCountId(surveyId, observationSubcountIds)
    ]);

    // Delete subcount records
    const surveyObservationIdsAffected = await this.subCountRepository.deleteObservationSubcountRecords(
      surveyId,
      observationSubcountIds
    );

    const observationService = new ObservationService(this.connection);

    // Get all survey observation ids that no longer have any subcount records
    const surveyObservationIdsToDelete = await observationService.getOrphanedSurveyObservationIds(surveyId, {
      filterFields: {
        surveyObservationIds: surveyObservationIdsAffected
      }
    });

    // Delete orphaned survey observation records
    await observationService.deleteObservationsByIds(surveyId, surveyObservationIdsToDelete);
  }

  /**
   * Delete observation_subcount records for the given set of survey observation ids.
   *
   * Note: This does NOT delete the parent survey observation records, even if they no longer have any subcount records.
   * All survey observation records should have at least one subcount record. The calling function needs to handle this
   * case, as needed.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationIds
   * @return {*}  {Promise<void>}
   * @memberof SubCountService
   */
  async deleteObservationSubCountRecordsByObservationId(
    surveyId: number,
    surveyObservationIds: number[]
  ): Promise<void> {
    const observationSubCountMeasurementService = new ObservationSubCountMeasurementService(this.connection);

    await Promise.all([
      // Delete child subcount_critter records, if any
      this.subCountRepository.deleteSubCountCritterRecordsForObservationId(surveyId, surveyObservationIds),
      // Delete child observation measurements, if any
      observationSubCountMeasurementService.deleteObservationMeasurements(surveyId, surveyObservationIds)
    ]);

    // Delete observation_subcount records, if any
    return this.subCountRepository.deleteObservationSubCountRecordsByObservationId(surveyId, surveyObservationIds);
  }

  /**
   * Returns a unique set of all measurement type definitions for all measurements of all observations in the given
   * survey.
   *
   * @param {number[]} surveyIds
   * @param {{
   *       filterFields?: {
   *         surveyObservationIds?: number[];
   *       };
   *     }} [options] Optional fields to additionally filter results by
   * @return {*}  {Promise<ObservationSubcountMeasurements>}
   * @memberof SubCountService
   */
  async getMeasurementTypeDefinitionsForSurveys(
    surveyIds: number[],
    options?: {
      filterFields?: {
        surveyObservationIds?: number[];
      };
    }
  ): Promise<ObservationSubcountMeasurements> {
    const observationSubCountMeasurementService = new ObservationSubCountMeasurementService(this.connection);

    // Fetch all unique taxon_measurement_ids for qualitative and quantitative measurements
    const [qualitativeTaxonMeasurementIds, quantitativeTaxonMeasurementIds] = await Promise.all([
      observationSubCountMeasurementService.getObservationSubCountQualitativeTaxonMeasurementIdsForSurveys(
        surveyIds,
        options
      ),
      observationSubCountMeasurementService.getObservationSubCountQuantitativeTaxonMeasurementIdsForSurveys(
        surveyIds,
        options
      )
    ]);

    const critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });

    // Fetch all measurement type definitions from Critterbase for the unique taxon_measurement_ids
    const response = await Promise.all([
      critterbaseService.getQualitativeMeasurementTypeDefinition(qualitativeTaxonMeasurementIds),
      critterbaseService.getQuantitativeMeasurementTypeDefinition(quantitativeTaxonMeasurementIds)
    ]);

    return { qualitative_measurements: response[0], quantitative_measurements: response[1] };
  }
}
