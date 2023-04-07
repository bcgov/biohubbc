import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/draft-create');

export class PostDraftObject {
  name: string;
  data: object;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostDraftData', message: 'params', obj });

    this.name = obj?.name || null;
    this.data = (obj?.data && obj.data) || {};
  }
}
