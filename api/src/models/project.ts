import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project');

/**
 * A single project item.
 *
 * @export
 * @interface IProject
 */
export interface IProject {
  id?: string;
  name: string;
  objectives: string;
  scientific_collection_permit_number: string;
  management_recovery_action: string;
  location_description: string;
  start_date: string;
  end_date: string;
  results: string;
  caveats: string;
  comments: string;
  create_date: string;
  create_user: number;
  update_date: string;
  update_user: number;
  revision_count: number;
}

/**
 * Project post request body.
 *
 * @export
 * @class PostProjectObject
 */
export class PostProjectObject {
  name: string;
  objectives: string;
  scientific_collection_permit_number: string;
  management_recovery_action: string;
  location_description: string;
  start_date: string;
  end_date: string;
  results: string;
  caveats: string;
  comments: string;
  create_date: string;
  create_user: number;
  update_date: string;
  update_user: number;
  revision_count: number;

  /**
   * Creates an instance of PostProjectObject.
   *
   * @param {*} [obj]
   * @memberof PostProjectObject
   */
  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', messaeg: 'params', obj });

    this.name = (obj && obj.name) || null;
    this.objectives = (obj && obj.objectives) || null;
    this.scientific_collection_permit_number = (obj && obj.scientific_collection_permit_number) || null;
    this.management_recovery_action = (obj && obj.management_recovery_action) || null;
    this.location_description = (obj && obj.location_description) || null;
    this.start_date = (obj && obj.start_date) || null;
    this.end_date = (obj && obj.end_date) || null;
    this.results = (obj && obj.results) || null;
    this.caveats = (obj && obj.caveats) || null;
    this.comments = (obj && obj.comments) || null;
    this.create_date = (obj && obj.create_date) || null;
    this.create_user = (obj && obj.create_user) || null;
    this.update_date = (obj && obj.update_date) || null;
    this.update_user = (obj && obj.update_user) || null;
    this.revision_count = (obj && obj.revision_count) || null;
  }
}
