import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/user');

export class UserObject {
  id: number;
  user_identifier: string;
  role_ids: number[];
  role_names: string[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'UserObject', message: 'params', obj });

    this.id = obj?.id || null;
    this.user_identifier = obj?.user_identifier || null;
    this.role_ids = (obj?.role_ids?.length && obj.role_ids) || [];
    this.role_names = (obj?.role_names?.length && obj.role_names) || [];
  }
}
