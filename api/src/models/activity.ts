import Ajv from 'ajv';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/activity');

/**
 * Activity post request body.
 *
 * @export
 * @class PostActivityObject
 */
export class PostActivityObject {
  /**
   * An array of tags used to identify this template.
   *
   * @type {string[]}
   * @memberof PostTemplateObj
   */
  tags: string[];

  /**
   * The id of the template that defines the form_data.
   *
   * @type {string}
   * @memberof PostActivityObject
   */
  template_id: string;

  /**
   * Form data.
   *
   * @type {object}
   * @memberof PostActivityObject
   */
  form_data: object;

  /**
   * Creates an instance of PostActivityObject.
   *
   * @param {*} [obj]
   * @memberof PostActivityObject
   */
  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostActivityObject', messaeg: 'params', obj });

    this.tags = (obj && obj.tags) || [];

    this.template_id = (obj && obj.template_id) || null;

    this.form_data = (obj && obj.form_data) || null;
  }
}
