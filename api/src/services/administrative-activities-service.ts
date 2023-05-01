import { SYSTEM_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { ApiGeneralError } from '../errors/api-error';
import { AdministrativeActivitiesRepository } from '../repositories/administrative-activities-repository';
import { IPermitModel, PermitRepository } from '../repositories/permit-repository';
import { DBService } from './db-service';
import { UserService } from './user-service';

export class AdministrativeActivitiesService extends DBService {
  administrativeActivitiesRepository: AdministrativeActivitiesRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.administrativeActivitiesRepository = new AdministrativeActivitiesRepository(connection);
  }

  
}
