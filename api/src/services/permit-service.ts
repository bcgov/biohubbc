import { HTTP400 } from '../errors/custom-error';
import { IPostPermitNoSampling, PostPermitNoSamplingObject } from '../models/permit-no-sampling';
import { PostCoordinatorData } from '../models/project-create';
import { PutCoordinatorData } from '../models/project-update';
import { queries } from '../queries/queries';
import { DBService } from './service';

interface IGetAllPermits {
  id: string;
  number: string;
  type: string;
  coordinator_agency: string;
  project_name: string;
}

interface IGetNonSamplingPermits {
  permit_id: string;
  number: string;
  type: string;
}

export class PermitService extends DBService {
  /**
   * get all non-sampling permits
   *
   * @param {(number | null)} systemUserId
   * @return {*}  {Promise<IGetAllPermits[]>}
   * @memberof PermitService
   */
  async getAllPermits(systemUserId: number | null): Promise<IGetAllPermits[]> {
    const sqlStatement = queries.permit.getAllPermitsSQL(systemUserId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get all user permits');
    }

    return response.rows;
  }

  /**
   * get all non-sampling permits
   *
   * @param {(number | null)} systemUserId
   * @return {*}  {Promise<IGetNonSamplingPermits[]>}
   * @memberof PermitService
   */
  async getNonSamplingPermits(systemUserId: number | null): Promise<IGetNonSamplingPermits[]> {
    const sqlStatement = queries.permit.getNonSamplingPermitsSQL(systemUserId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get all user permits');
    }

    return response.rows;
  }

  /**
   * Creates new no sample permit objects and insert all
   *
   * @param {object} permitRequestBody
   * @return {*}  {Promise<number[]>}
   * @memberof PermitService
   */
  async createNoSamplePermits(permitRequestBody: object): Promise<number[]> {
    const sanitizedNoSamplePermitPostData = new PostPermitNoSamplingObject(permitRequestBody);

    if (!sanitizedNoSamplePermitPostData.permit || !sanitizedNoSamplePermitPostData.permit.permits.length) {
      throw new HTTP400('Missing request body param `permit`');
    }

    if (!sanitizedNoSamplePermitPostData.coordinator) {
      throw new HTTP400('Missing request body param `coordinator`');
    }

    return await Promise.all(
      sanitizedNoSamplePermitPostData.permit.permits.map((permit: IPostPermitNoSampling) =>
        this.insertNoSamplePermit(permit, sanitizedNoSamplePermitPostData.coordinator)
      )
    );
  }

  /**
   * insert a no sample permit row.
   *
   * @param {IPostPermitNoSampling} permit
   * @param {(PostCoordinatorData | PutCoordinatorData)} coordinator
   * @return {*}  {Promise<number>}
   * @memberof PermitService
   */
  async insertNoSamplePermit(
    permit: IPostPermitNoSampling,
    coordinator: PostCoordinatorData | PutCoordinatorData
  ): Promise<number> {
    const systemUserId = this.connection.systemUserId();

    const sqlStatement = queries.permit.postPermitNoSamplingSQL({ ...permit, ...coordinator }, systemUserId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert non-sampling permit data');
    }

    return result.id;
  }
}
