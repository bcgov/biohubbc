import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project');

/**
 * A single project item.
 *
 * @export
 * @interface IProject
 */
export interface IProject {
  project_id?: string;
  tags: string[];
}

/**
 * Project post request body.
 *
 * @export
 * @class PostProjectObject
 */
export class PostProjectObject {
  /**
   * An array of tags used to identify this template.
   *
   * @type {string[]}
   * @memberof PostTemplateObj
   */
  tags: string[];

  /**
   * Creates an instance of PostProjectObject.
   *
   * @param {*} [obj]
   * @memberof PostProjectObject
   */
  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', messaeg: 'params', obj });

    this.tags = (obj && obj.tags) || [];
  }
}
