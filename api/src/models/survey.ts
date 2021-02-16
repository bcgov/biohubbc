import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/survey');

/**
 * A single survey item.
 *
 * @export
 * @interface ISurvey
 */
export interface ISurvey {
  id?: string;
  tags: string[];
}

/**
 * Survey post request body.
 *
 * @export
 * @class PostSurveyObject
 */
export class PostSurveyObject {
  /**
   * An array of tags used to identify this template.
   *
   * @type {string[]}
   * @memberof PostTemplateObj
   */
  tags: string[];

  /**
   * Creates an instance of PostSurveyObject.
   *
   * @param {*} [obj]
   * @memberof PostSurveyObject
   */
  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostSurveyObject', message: 'params', obj });

    this.tags = (obj && obj.tags) || [];
  }
}
