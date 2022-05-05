import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/user');

export class UserObject {
  id: number;
  user_identifier: string;
  record_end_date: string;
  role_ids: number[];
  role_names: string[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'UserObject', message: 'params', obj });

    this.id = obj?.system_user_id || null;
    this.user_identifier = obj?.user_identifier || null;
    this.record_end_date = obj?.record_end_date || null;
    this.role_ids = (obj?.role_ids?.length && obj.role_ids) || [];
    this.role_names = (obj?.role_names?.length && obj.role_names) || [];
  }
}

export class ProjectUserObject {
  project_id: number;
  system_user_id: number;
  project_role_ids: number[];
  project_role_names: string[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'ProjectUserObject', message: 'params', obj });

    this.project_id = obj?.project_id || null;
    this.system_user_id = obj?.system_user_id || null;
    this.project_role_ids = (obj?.project_role_ids?.length && obj.project_role_ids) || [];
    this.project_role_names = (obj?.project_role_names?.length && obj.project_role_names) || [];
  }
}
