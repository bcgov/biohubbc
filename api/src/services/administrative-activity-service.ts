import { IDBConnection } from '../database/db';
import {
  AdministrativeActivityRepository,
  IAdministrativeActivity,
  IAdministrativeActivityStanding,
  ICreateAdministrativeActivity
} from '../repositories/administrative-activity-repository';
import { DBService } from './db-service';
import { GCNotifyService, IgcNotifyPostReturn } from './gcnotify-service';
import { ACCESS_REQUEST_ADMIN_EMAIL } from '../constants/notifications';
import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from '../paths/administrative-activities';

/**
 * @TODO jsdoc
 */
export class AdministrativeActivityService extends DBService {
  ADMIN_EMAIL: string;
  APP_HOST: string;
  NODE_ENV: string;

  administrativeActivityRepository: AdministrativeActivityRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.ADMIN_EMAIL = process.env.GCNOTIFY_ADMIN_EMAIL || '';
    this.APP_HOST = process.env.APP_HOST || '';
    this.NODE_ENV = process.env.NODE_ENV || '';

    this.administrativeActivityRepository = new AdministrativeActivityRepository(connection);
  }

  /**
   * @TODO jsdoc
   * @param administrativeActivityTypeNames 
   * @param administrativeActivityStatusTypes 
   * @returns 
   */
  async getAdministrativeActivities (
    administrativeActivityTypeNames?: string[],
    administrativeActivityStatusTypes?: string[]
  ): Promise<IAdministrativeActivity[]> {
    return this.administrativeActivityRepository.getAdministrativeActivities(
      administrativeActivityTypeNames,
      administrativeActivityStatusTypes
    );
  }

  /**
   * @TODO jsdoc
   */
  async postAdministrativeActivity(systemUserId: number, data: string | object): Promise<ICreateAdministrativeActivity> {
    return this.administrativeActivityRepository.postAdministrativeActivity(systemUserId, data);
  }

  /**
   * @TODO jsdoc
   */
  async putAdministrativeActivity(
    administrativeActivityId: number,
    administrativeActivityStatusTypeName: ADMINISTRATIVE_ACTIVITY_STATUS_TYPE
  ): Promise<{ id: number }> {
    return this.administrativeActivityRepository.putAdministrativeActivity(
      administrativeActivityId,
      administrativeActivityStatusTypeName
    );
  }

  /**
   * @TODO jsdoc
   */
  async getAdministrativeActivityStanding(userIdentifier: string): Promise<IAdministrativeActivityStanding> {
    return this.administrativeActivityRepository.getAdministrativeActivityStanding(userIdentifier);
  }

  /**
   * @TODO jsdoc
   */
  async sendAccessRequestEmail(): Promise<IgcNotifyPostReturn> {
    const gcnotifyService = new GCNotifyService();
    const url = `${this.APP_HOST}/admin/users?authLogin=true`;
    const hrefUrl = `[click here.](${url})`;

    return gcnotifyService.sendEmailGCNotification(this.ADMIN_EMAIL, {
      ...ACCESS_REQUEST_ADMIN_EMAIL,
      subject: `${this.NODE_ENV}: ${ACCESS_REQUEST_ADMIN_EMAIL.subject}`,
      body1: `${ACCESS_REQUEST_ADMIN_EMAIL.body1} ${hrefUrl}`,
      footer: `${this.APP_HOST}`
    });
  }
}
