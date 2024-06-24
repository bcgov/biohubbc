import { IDBConnection } from '../database/db';
import { SurveyCritterRepository } from '../repositories/survey-critter-repository';
import { CritterbaseService } from './critterbase-service';
import { DBService } from './db-service';
import { PlatformService } from './platform-service';

export class ImportCrittersService extends DBService {
  critterRepository: SurveyCritterRepository;
  platformService: PlatformService;
  critterbaseService: CritterbaseService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.critterRepository = new SurveyCritterRepository(connection);
    this.platformService = new PlatformService(connection);
    this.critterbaseService = new CritterbaseService({
      keycloak_guid: connection.systemUserGUID(),
      username: connection.systemUserIdentifier()
    });
  }
}
