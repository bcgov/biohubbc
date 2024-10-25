import { IDBConnection } from '../database/db';
import { IAllTelemetryAdvancedFilters } from '../models/telemetry-view';
import { SurveyCritterRecord } from '../repositories/survey-critter-repository';
import { Deployment, TelemetryRepository } from '../repositories/telemetry-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { AttachmentService } from './attachment-service';
import { BctwDeploymentRecord, BctwDeploymentService } from './bctw-service/bctw-deployment-service';
import { BctwTelemetryService, IAllTelemetry } from './bctw-service/bctw-telemetry-service';
import { ICritter } from './critterbase-service';
import { DBService } from './db-service';
import { SurveyCritterService } from './survey-critter-service';

export type FindTelemetryResponse = { telemetry_id: string } & Pick<
  IAllTelemetry,
  'acquisition_date' | 'latitude' | 'longitude' | 'telemetry_type'
> &
  Pick<BctwDeploymentRecord, 'device_id'> &
  Pick<Deployment, 'bctw_deployment_id' | 'critter_id' | 'deployment_id'> &
  Pick<SurveyCritterRecord, 'critterbase_critter_id'> &
  Pick<ICritter, 'animal_id'>;

/**
 *
 * @deprecated Dropped after BCTW migration
 */
export class TelemetryService extends DBService {
  telemetryRepository: TelemetryRepository;

  attachmentService: AttachmentService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.telemetryRepository = new TelemetryRepository(connection);

    this.attachmentService = new AttachmentService(connection);
  }

  /**
   * Retrieves the paginated list of all telemetry records that are available to the user, based on their permissions
   * and provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {IAllTelemetryAdvancedFilters} [filterFields]
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<FindTelemetryResponse[]>}
   * @memberof TelemetryService
   */
  async findTelemetry(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields?: IAllTelemetryAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindTelemetryResponse[]> {
    // --- Step 1 -----------------------------

    const surveyCritterService = new SurveyCritterService(this.connection);
    // The SIMS critter records the user has access to
    const simsCritters = await surveyCritterService.findCritters(
      isUserAdmin,
      systemUserId,
      filterFields,
      // Remove the sort and order from the pagination object as these are based on the telemetry sort columns and
      // may not be valid for the critter columns
      // TODO: Is there a better way to achieve this pagination safety?
      pagination
        ? {
            ...pagination,
            sort: undefined,
            order: undefined
          }
        : undefined
    );

    if (!simsCritters.length) {
      // Exit early if there are no SIMS critters, and therefore no telemetry
      return [];
    }

    // --- Step 2 ------------------------------

    const simsCritterIds = simsCritters.map((critter) => critter.critter_id);
    // The sims deployment records the user has access to
    const simsDeployments = await this.telemetryRepository.getDeploymentsByCritterIds(simsCritterIds);

    if (!simsDeployments.length) {
      // Exit early if there are no SIMS deployments, and therefore no telemetry
      return [];
    }

    // --- Step 3 ------------------------------

    const critterbaseCritterIds = simsCritters
      .filter((simsCritter) =>
        simsDeployments.some((surveyDeployment) => surveyDeployment.critter_id === simsCritter.critter_id)
      )
      .map((critter) => critter.critterbase_critter_id);

    if (!critterbaseCritterIds.length) {
      // Exit early if there are no critterbase critters, and therefore no telemetry
      return [];
    }

    const user = {
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    };

    const bctwDeploymentService = new BctwDeploymentService(user);
    const bctwTelemetryService = new BctwTelemetryService(user);

    // The detailed deployment records from BCTW
    // Note: This may include records the user does not have acces to (A critter may have multiple deployments over its
    // lifespan, but the user may only have access to a subset of them).
    const allBctwDeploymentsForCritters = await bctwDeploymentService.getDeploymentsByCritterId(critterbaseCritterIds);

    // Remove records the user does not have access to
    const usersBctwDeployments = allBctwDeploymentsForCritters.filter((deployment) =>
      simsDeployments.some((item) => item.bctw_deployment_id === deployment.deployment_id)
    );
    const usersBctwDeploymentIds = usersBctwDeployments.map((deployment) => deployment.deployment_id);

    if (!usersBctwDeploymentIds.length) {
      // Exit early if there are no BCTW deployments the user has access to, and therefore no telemetry
      return [];
    }

    // --- Step 4 ------------------------------

    // The telemetry records for the deployments the user has access to
    const allTelemetryRecords = await bctwTelemetryService.getAllTelemetryByDeploymentIds(usersBctwDeploymentIds);

    // --- Step 5 ------------------------------

    // Parse/combine the telemetry, deployment, and critter records into the final response
    const response: FindTelemetryResponse[] = [];
    for (const telemetryRecord of allTelemetryRecords) {
      const usersBctwDeployment = usersBctwDeployments.find(
        (usersBctwDeployment) => usersBctwDeployment.deployment_id === telemetryRecord.deployment_id
      );

      if (!usersBctwDeployment) {
        continue;
      }

      const simsDeployment = simsDeployments.find(
        (simsDeployment) => simsDeployment.bctw_deployment_id === telemetryRecord.deployment_id
      );

      if (!simsDeployment) {
        continue;
      }

      const simsCritter = simsCritters.find(
        (simsCritter) => simsCritter.critterbase_critter_id === usersBctwDeployment?.critter_id
      );

      if (!simsCritter) {
        continue;
      }

      response.push({
        // IAllTelemetry
        telemetry_id: telemetryRecord.telemetry_id ?? telemetryRecord.telemetry_manual_id,
        acquisition_date: telemetryRecord.acquisition_date,
        latitude: telemetryRecord.latitude,
        longitude: telemetryRecord.longitude,
        telemetry_type: telemetryRecord.telemetry_type,
        // BctwDeploymentRecord
        device_id: usersBctwDeployment.device_id,
        // Deployment
        bctw_deployment_id: telemetryRecord.deployment_id,
        critter_id: simsDeployment.critter_id,
        deployment_id: simsDeployment.deployment_id,
        // SurveyCritterRecord
        critterbase_critter_id: usersBctwDeployment.critter_id,
        // ICritter
        animal_id: simsCritter.animal_id
      });
    }

    return response;
  }
}
