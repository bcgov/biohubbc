import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/template');

/**
 * POST template object.
 *
 * @export
 * @class PostTemplateObj
 */
export class PostTemplateObj {
  /**
   * The name of the template.
   *
   * @type {string}
   * @memberof PostTemplateObj
   */
  name: string;

  /**
   * A description of the template.
   *
   * @type {string}
   * @memberof PostTemplateObj
   */
  description: string;

  /**
   * An array of tags used to identify this template.
   *
   * @type {string[]}
   * @memberof PostTemplateObj
   */
  tags: string[];

  /**
   * Template that defines the form fields and their data types/constraints.
   *
   * Note: this must conform to the JSON-Schema specification.
   *
   * See: https://json-schema.org/
   *
   * @type {object}
   * @memberof PostTemplateObj
   */
  data_template: object;

  /**
   * Template that defines the UI characteristics of the form fields.
   *
   * See: https://react-jsonschema-form.readthedocs.io/en/latest/api-reference/uiSchema/
   *
   * @type {object}
   * @memberof PostTemplateObj
   */
  ui_template: object;

  /**
   * Creates an instance of PostTemplateObj.
   *
   * @param {*} [obj]
   * @memberof ActivityPostRequestBody
   */
  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostTemplateObj', messaeg: 'params', obj });

    this.name = (obj && obj.name) || [];
    this.description = (obj && obj.description) || [];

    this.tags = (obj && obj.tags) || [];

    this.data_template = (obj && obj.data_template) || null;
    this.ui_template = (obj && obj.ui_template) || null;
  }
}
