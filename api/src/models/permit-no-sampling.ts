import { getLogger } from '../utils/logger';
import { PostCoordinatorData, PostPermitData } from './project-create';

const defaultLog = getLogger('models/permit-no-sampling');

/**
 * Processes POST /permit-no-sampling request data when no sampling is conducted.
 *
 * @export
 * @class PostPermitNoSamplingObject
 */
export class PostPermitNoSamplingObject {
  coordinator: PostCoordinatorData;
  permit: PostPermitData;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostPermitNoSamplingObject', message: 'params', obj });

    this.coordinator = (obj?.coordinator && new PostCoordinatorData(obj.coordinator)) || null;
    this.permit = (obj?.permit && new PostPermitData(obj.permit)) || null;
  }
}

export interface IPostPermitNoSampling {
  permit_number: string;
  permit_type: string;
}
