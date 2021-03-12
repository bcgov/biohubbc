import { getLogger } from '../utils/logger';
import { PostCoordinatorData } from './project';

const defaultLog = getLogger('models/project');

/**
 * Processes POST /permit-no-sampling request data when no sampling is conducted.
 *
 * @export
 * @class PostPermitNoSamplingObject
 */
export class PostPermitNoSamplingObject {
  coordinator: PostCoordinatorData;
  permit: PostPermitNoSamplingData;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostPermitNoSamplingObject', message: 'params', obj });

    this.coordinator = (obj?.coordinator && new PostCoordinatorData(obj.coordinator)) || null;
    this.permit = (obj?.permit && new PostPermitNoSamplingData(obj.permit)) || null;
  }
}

export interface IPostPermitNoSampling {
  permit_number: string;
}

/**
 * Processes POST /permit-no-sampling permit data
 *
 * @export
 * @class PostPermitNoSamplingData
 */
export class PostPermitNoSamplingData {
  permits: IPostPermitNoSampling[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostPermitNoSamplingData', message: 'params', obj });

    this.permits =
      (obj?.permits?.length &&
        obj.permits.map((item: any) => {
          return {
            permit_number: item.permit_number
          };
        })) ||
      [];
  }
}
